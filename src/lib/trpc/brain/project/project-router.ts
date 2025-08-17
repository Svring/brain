import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ProjectContext } from "./project-context";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  listProjects,
  getProject,
} from "@/lib/brain/resources/project/project-method/project-query";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";

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
      // For now, return empty array until we implement the server-side version
      return [];
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
      // Note: This would need to be adapted to work without React hooks
      // You might need to create a server-side version of the mutation
      throw new Error(
        "createProject mutation not yet implemented for server-side"
      );
    }),

  addToProject: t.procedure
    .input(
      z.object({
        resources: z.array(CustomResourceTargetSchema),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Note: This would need to be adapted to work without React hooks
      // You might need to create a server-side version of the mutation
      throw new Error(
        "addToProject mutation not yet implemented for server-side"
      );
    }),

  removeFromProject: t.procedure
    .input(
      z.object({
        resources: z.array(CustomResourceTargetSchema),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Note: This would need to be adapted to work without React hooks
      // You might need to create a server-side version of the mutation
      throw new Error(
        "removeFromProject mutation not yet implemented for server-side"
      );
    }),

  deleteProject: t.procedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Note: This would need to be adapted to work without React hooks
      // You might need to create a server-side version of the mutation
      throw new Error(
        "deleteProject mutation not yet implemented for server-side"
      );
    }),

  // K8s Operations
  getProjectK8s: t.procedure
    .input(
      z.object({
        context: K8sApiContextSchema,
        target: CustomResourceTargetSchema,
      })
    )
    .query(async ({ input }) => {
      // This would need to be implemented based on your K8s API structure
      throw new Error("getProjectK8s not yet implemented");
    }),

  listProjectK8s: t.procedure
    .input(K8sApiContextSchema)
    .query(async ({ input }) => {
      return await listProjects(input);
    }),
});

export type ProjectRouter = typeof projectRouter;
