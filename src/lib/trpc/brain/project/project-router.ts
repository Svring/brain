import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ProjectContext } from "./project-context";
import {
  CustomResourceTargetSchema,
  BuiltinResourceTargetSchema,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  listProjects,
  getProject,
} from "@/lib/brain/resources/project/project-method/project-query";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  patchCustomResourceMetadata,
  patchBuiltinResourceMetadata,
  removeCustomResourceMetadata,
  removeBuiltinResourceMetadata,
  upsertCustomResource,
  deleteCustomResource,
  deleteBuiltinResource,
} from "@/lib/k8s/k8s-api/k8s-api-mutation";
import { runParallelAction } from "next-server-actions-parallel";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "@/lib/brain/resources/project/project-constant/project-constant-annotation";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { getProjectRelatedResources } from "@/lib/brain/resources/project/project-method/project-relevance";
import { convertInstanceToProject } from "@/lib/brain/resources/project/project-method/project-utils";

const t = initTRPC.context<ProjectContext>().create();

export const projectRouter = t.router({
  // Project Query Operations
  listProjects: t.procedure
    .output(z.array(ProjectObjectSchema))
    .query(async ({ ctx }) => {
      return await listProjects(ctx);
    }),

  getProject: t.procedure
    .input(z.string())
    .output(ProjectObjectSchema)
    .query(async ({ ctx, input }) => {
      return await getProject(ctx, input);
    }),

  getProjectResources: t.procedure
    .input(
      z.object({
        name: z.string(),
        enabledSubModules: z.array(z.string()).optional(),
      })
    )
    .output(z.array(CustomResourceTargetSchema))
    .query(async ({ ctx, input }) => {
      const enabledSubModules = input.enabledSubModules || [
        "devbox",
        "cluster",
        "deployment",
        "statefulset",
      ];

      // Get project related resources
      const projectResources = await getProjectRelatedResources(
        ctx,
        input.name,
        enabledSubModules
      );

      // Convert resources to targets
      const targets: any[] = [];

      // Process custom resources
      for (const resourceList of Object.values(projectResources.custom || {})) {
        if (resourceList?.items) {
          for (const resource of resourceList.items) {
            if (resource.metadata?.name) {
              const target = convertResourceTypeToTarget(
                resource.kind?.toLowerCase() || "instance",
                resource.metadata.name
              );
              if (target.type === "custom") {
                targets.push(target);
              }
            }
          }
        }
      }

      // Process builtin resources
      for (const resourceList of Object.values(
        projectResources.builtin || {}
      )) {
        if (resourceList?.items) {
          for (const resource of resourceList.items) {
            if (resource.metadata?.name) {
              const target = convertResourceTypeToTarget(
                resource.kind?.toLowerCase() || "deployment",
                resource.metadata.name
              );
              if (target.type === "builtin") {
                targets.push(target);
              }
            }
          }
        }
      }

      return targets;
    }),

  // Project Mutation Operations
  createProject: t.procedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .output(ProjectObjectSchema)
    .mutation(async ({ ctx, input }) => {
      const target = CustomResourceTargetSchema.parse(
        convertResourceTypeToTarget("instance", input.name)
      );
      const resourceBody = {
        apiVersion: "app.sealos.io/v1",
        kind: "Instance",
        metadata: {
          name: input.name,
          namespace: ctx.namespace,
          labels: {
            [INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS]: input.name,
          },
        },
        spec: {
          templateType: "inline",
          defaults: {
            app_name: {
              type: "string",
              value: input.name,
            },
          },
          title: input.name,
        },
      };

      const instanceResource = await runParallelAction(
        upsertCustomResource(ctx, target, resourceBody)
      );

      const project = convertInstanceToProject(instanceResource);
      if (!project) {
        throw new Error("Failed to create project");
      }
      return project;
    }),

  addToProject: t.procedure
    .input(
      z.object({
        resources: z.array(
          CustomResourceTargetSchema.or(BuiltinResourceTargetSchema)
        ),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Add labels to all resources
      for (const resource of input.resources) {
        if (resource.type === "custom") {
          await patchCustomResourceMetadata(
            ctx,
            resource,
            "labels",
            INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
            input.name
          );
        } else {
          await patchBuiltinResourceMetadata(
            ctx,
            resource,
            "labels",
            INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
            input.name
          );
        }
      }

      return { success: true };
    }),

  removeFromProject: t.procedure
    .input(
      z.object({
        resources: z.array(CustomResourceTargetSchema),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Remove project label from all resources
      for (const resource of input.resources) {
        if (resource.type === "custom") {
          await removeCustomResourceMetadata(
            ctx,
            resource,
            "labels",
            INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS
          );
        } else {
          // Type assertion for builtin resources
          const builtinResource = resource as any;
          await removeBuiltinResourceMetadata(
            ctx,
            builtinResource,
            "labels",
            INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS
          );
        }
      }

      return { success: true };
    }),

  deleteProject: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // 1. Get all resources related to the project
      const projectResources = await getProjectRelatedResources(ctx, input, [
        "deployment",
        "statefulset",
        "instance",
        "devbox",
      ]);

      // 2. Delete all found resources
      const deletePromises: Promise<any>[] = [];

      // Delete custom resources
      for (const resourceList of Object.values(projectResources.custom || {})) {
        if (resourceList?.items) {
          for (const resource of resourceList.items) {
            if (resource.metadata?.name) {
              const target = convertResourceTypeToTarget(
                resource.kind?.toLowerCase() || "instance",
                resource.metadata.name
              );
              if (target.type === "custom") {
                deletePromises.push(deleteCustomResource(ctx, target));
              }
            }
          }
        }
      }

      // Delete builtin resources
      for (const resourceList of Object.values(
        projectResources.builtin || {}
      )) {
        if (resourceList?.items) {
          for (const resource of resourceList.items) {
            if (resource.metadata?.name) {
              const target = convertResourceTypeToTarget(
                resource.kind?.toLowerCase() || "deployment",
                resource.metadata.name
              );
              if (target.type === "builtin") {
                deletePromises.push(deleteBuiltinResource(ctx, target));
              }
            }
          }
        }
      }

      await Promise.allSettled(deletePromises);

      return { name: input, success: true };
    }),

  updateProjectName: t.procedure
    .input(
      z.object({
        name: z.string(),
        newDisplayName: z.string(),
      })
    )
    .output(
      z.object({
        name: z.string(),
        newDisplayName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const target = CustomResourceTargetSchema.parse(
        convertResourceTypeToTarget("instance", input.name)
      );

      await patchCustomResourceMetadata(
        ctx,
        target,
        "annotations",
        PROJECT_DISPLAY_NAME_ANNOTATION_KEY,
        input.newDisplayName
      );

      return {
        name: input.name,
        newDisplayName: input.newDisplayName,
      };
    }),
});

export type ProjectRouter = typeof projectRouter;
