import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { K8sContext } from "./k8s-context";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  listAllResources,
  getResource,
  listAnnotationBasedResources,
} from "@/lib/k8s/k8s-method/k8s-query";
import {
  patchCustomResourceMetadata,
  patchBuiltinResourceMetadata,
  removeCustomResourceMetadata,
  removeBuiltinResourceMetadata,
  upsertCustomResource,
  upsertBuiltinResource,
  deleteCustomResource,
  deleteBuiltinResource,
  patchCustomResource,
  patchBuiltinResource,
  strategicMergePatchCustomResource,
  strategicMergePatchBuiltinResource,
} from "@/lib/k8s/k8s-api/k8s-api-mutation";
import { runParallelAction } from "next-server-actions-parallel";
import { Operation } from "fast-json-patch";

const t = initTRPC.context<K8sContext>().create();

export const k8sRouter = t.router({
  // Query Operations
  listAllResources: t.procedure
    .input(
      z.object({
        labelSelector: z.string().optional(),
        builtinResourceTypes: z.array(z.string()).optional(),
        customResourceTypes: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await listAllResources(
        ctx,
        input.labelSelector,
        input.builtinResourceTypes,
        input.customResourceTypes
      );
    }),

  getResource: t.procedure
    .input(z.union([CustomResourceTargetSchema, BuiltinResourceTargetSchema]))
    .query(async ({ ctx, input }) => {
      return await getResource(ctx, input);
    }),

  listAnnotationBasedResources: t.procedure
    .input(
      z.object({
        annotation: z.object({
          custom: z.array(z.object({ kind: z.string(), name: z.string() })),
          builtin: z.array(z.object({ kind: z.string(), name: z.string() })),
        }),
        projectName: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await listAnnotationBasedResources(
        ctx,
        input.annotation,
        input.projectName
      );
    }),

  // Mutation Operations
  patchResourceMetadata: t.procedure
    .input(
      z.object({
        target: z.union([
          CustomResourceTargetSchema,
          BuiltinResourceTargetSchema,
          z.array(
            z.union([CustomResourceTargetSchema, BuiltinResourceTargetSchema])
          ),
        ]),
        metadataType: z.enum(["annotations", "labels"]),
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targets = Array.isArray(input.target)
        ? input.target
        : [input.target];

      const results = await Promise.all(
        targets.map(async (target) => {
          if (target.type === "custom") {
            return await runParallelAction(
              patchCustomResourceMetadata(
                ctx,
                target,
                input.metadataType,
                input.key,
                input.value
              )
            );
          } else {
            return await runParallelAction(
              patchBuiltinResourceMetadata(
                ctx,
                target,
                input.metadataType,
                input.key,
                input.value
              )
            );
          }
        })
      );

      return results;
    }),

  removeResourceMetadata: t.procedure
    .input(
      z.object({
        target: z.union([
          CustomResourceTargetSchema,
          BuiltinResourceTargetSchema,
          z.array(
            z.union([CustomResourceTargetSchema, BuiltinResourceTargetSchema])
          ),
        ]),
        metadataType: z.enum(["annotations", "labels"]),
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targets = Array.isArray(input.target)
        ? input.target
        : [input.target];

      const results = await Promise.all(
        targets.map(async (target) => {
          if (target.type === "custom") {
            return await runParallelAction(
              removeCustomResourceMetadata(
                ctx,
                target,
                input.metadataType,
                input.key
              )
            );
          } else {
            return await runParallelAction(
              removeBuiltinResourceMetadata(
                ctx,
                target,
                input.metadataType,
                input.key
              )
            );
          }
        })
      );

      return results;
    }),

  deleteResource: t.procedure
    .input(
      z.object({
        target: z.union([
          CustomResourceTargetSchema,
          BuiltinResourceTargetSchema,
          z.array(
            z.union([CustomResourceTargetSchema, BuiltinResourceTargetSchema])
          ),
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targets = Array.isArray(input.target)
        ? input.target
        : [input.target];

      const results = await Promise.all(
        targets.map(async (target) => {
          if (target.type === "custom") {
            return await runParallelAction(deleteCustomResource(ctx, target));
          } else {
            return await runParallelAction(deleteBuiltinResource(ctx, target));
          }
        })
      );

      return results;
    }),

  upsertResource: t.procedure
    .input(
      z.object({
        target: z.union([
          CustomResourceTargetSchema,
          BuiltinResourceTargetSchema,
        ]),
        resourceBody: z.record(z.unknown()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.target.type === "custom") {
        return await runParallelAction(
          upsertCustomResource(ctx, input.target, input.resourceBody)
        );
      } else {
        return await runParallelAction(
          upsertBuiltinResource(ctx, input.target, input.resourceBody)
        );
      }
    }),

  patchResource: t.procedure
    .input(
      z.object({
        target: z.union([
          CustomResourceTargetSchema,
          BuiltinResourceTargetSchema,
        ]),
        patchBody: z.array(z.record(z.unknown())), // Operation[]
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.target.type === "custom") {
        return await runParallelAction(
          patchCustomResource(
            ctx,
            input.target,
            input.patchBody as unknown as Operation[]
          )
        );
      } else {
        return await runParallelAction(
          patchBuiltinResource(
            ctx,
            input.target,
            input.patchBody as unknown as Operation[]
          )
        );
      }
    }),

  strategicMergePatchResource: t.procedure
    .input(
      z.object({
        target: z.union([
          CustomResourceTargetSchema,
          BuiltinResourceTargetSchema,
        ]),
        patchBody: z.record(z.unknown()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.target.type === "custom") {
        return await runParallelAction(
          strategicMergePatchCustomResource(ctx, input.target, input.patchBody)
        );
      } else {
        return await runParallelAction(
          strategicMergePatchBuiltinResource(ctx, input.target, input.patchBody)
        );
      }
    }),
});

export type K8sRouter = typeof k8sRouter;
