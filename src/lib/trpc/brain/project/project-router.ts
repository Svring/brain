import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ProjectContext } from "./project-context";
import {
  CustomResourceTargetSchema,
  BuiltinResourceTargetSchema,
  BuiltinResourceTarget,
  ResourceTargetSchema,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  listProjects,
  getProject,
} from "@/lib/brain/resources/project/project-method/project-query";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getAllProjectLogs,
  getProjectResources,
  createProject,
  deleteProject,
  addResourcesToProject,
  removeResourcesFromProject,
  updateProjectName,
} from "@/lib/brain/resources/project/project-api/project-api-service";

const t = initTRPC.context<ProjectContext>().create();

export const projectRouter = t.router({
  // ===== QUERY PROCEDURES =====

  // Project Information
  list: t.procedure
    .output(z.array(ProjectObjectSchema))
    .query(async ({ ctx }) => {
      return await listProjects(ctx);
    }),

  get: t.procedure
    .input(z.string())
    .output(ProjectObjectSchema)
    .query(async ({ ctx, input }) => {
      return await getProject(ctx, input);
    }),

  getResources: t.procedure
    .input(z.string())
    .output(
      z.object({
        targets: z.array(ResourceTargetSchema),
        resources: z.array(z.any()),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await getProjectResources(ctx, { name: input });
      return result;
    }),

  allLogs: t.procedure
    .input(
      z.object({
        clusterResources: z.array(
          z.object({
            name: z.string(),
            kind: z.string(),
          })
        ),
        launchpadResources: z.array(
          z.object({
            name: z.string(),
            kind: z.string(),
          })
        ),
      })
    )
    .output(
      z.object({
        logs: z.array(
          z.object({
            name: z.string(),
            kind: z.string(),
            logs: z.any(),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getAllProjectLogs(ctx, ctx.sealosContext, input);
    }),

  // ===== MUTATION PROCEDURES =====

  // Project Lifecycle Management
  create: t.procedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .output(ProjectObjectSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await createProject(ctx, input);
      return result.project;
    }),

  delete: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const result = await deleteProject(ctx, { name: input });
    return result;
  }),

  // Resource Management
  addResources: t.procedure
    .input(
      z.object({
        resources: z.array(
          CustomResourceTargetSchema.or(BuiltinResourceTargetSchema)
        ),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await addResourcesToProject(ctx, input);
      return result;
    }),

  removeResources: t.procedure
    .input(
      z.object({
        resources: z.array(ResourceTargetSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await removeResourcesFromProject(ctx, input);
      return result;
    }),

  // Project Configuration
  updateName: t.procedure
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
      const result = await updateProjectName(ctx, input);
      return result;
    }),
});

export type ProjectRouter = typeof projectRouter;
