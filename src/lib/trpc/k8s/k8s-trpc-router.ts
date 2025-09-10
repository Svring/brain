import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { K8sContext } from "./k8s-trpc-context";
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
  // ===== QUERY PROCEDURES =====

  // Resource Information
  list: t.procedure
    .input(
      z.object({
        labelSelector: z.string().optional(),
        builtinResourceTypes: z.array(z.string()).optional(),
        customResourceTypes: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { labelSelector, builtinResourceTypes, customResourceTypes } =
        input;
      return await listAllResources(
        ctx,
        labelSelector,
        builtinResourceTypes,
        customResourceTypes
      );
    }),

  get: t.procedure
    .input(z.union([CustomResourceTargetSchema, BuiltinResourceTargetSchema]))
    .query(async ({ ctx, input }) => {
      return await getResource(ctx, input);
    }),

  listByAnnotation: t.procedure
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
      const { annotation, projectName } = input;
      return await listAnnotationBasedResources(ctx, annotation, projectName);
    }),

  // ===== MUTATION PROCEDURES =====

  // Resource Lifecycle Management
  delete: t.procedure
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

  upsert: t.procedure
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
      const { target, resourceBody } = input;

      if (target.type === "custom") {
        return await runParallelAction(
          upsertCustomResource(ctx, target, resourceBody)
        );
      } else {
        return await runParallelAction(
          upsertBuiltinResource(ctx, target, resourceBody)
        );
      }
    }),

  // Resource Patching
  patch: t.procedure
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
      const { target, patchBody } = input;

      if (target.type === "custom") {
        return await runParallelAction(
          patchCustomResource(ctx, target, patchBody as unknown as Operation[])
        );
      } else {
        return await runParallelAction(
          patchBuiltinResource(ctx, target, patchBody as unknown as Operation[])
        );
      }
    }),

  strategicMergePatch: t.procedure
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
      const { target, patchBody } = input;

      if (target.type === "custom") {
        return await runParallelAction(
          strategicMergePatchCustomResource(ctx, target, patchBody)
        );
      } else {
        return await runParallelAction(
          strategicMergePatchBuiltinResource(ctx, target, patchBody)
        );
      }
    }),

  // Metadata Management
  patchMetadata: t.procedure
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
      const { target, metadataType, key, value } = input;
      const targets = Array.isArray(target) ? target : [target];

      const results = await Promise.all(
        targets.map(async (target) => {
          if (target.type === "custom") {
            return await runParallelAction(
              patchCustomResourceMetadata(ctx, target, metadataType, key, value)
            );
          } else {
            return await runParallelAction(
              patchBuiltinResourceMetadata(
                ctx,
                target,
                metadataType,
                key,
                value
              )
            );
          }
        })
      );

      return results;
    }),

  removeMetadata: t.procedure
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
      const { target, metadataType, key } = input;
      const targets = Array.isArray(target) ? target : [target];

      const results = await Promise.all(
        targets.map(async (target) => {
          if (target.type === "custom") {
            return await runParallelAction(
              removeCustomResourceMetadata(ctx, target, metadataType, key)
            );
          } else {
            return await runParallelAction(
              removeBuiltinResourceMetadata(ctx, target, metadataType, key)
            );
          }
        })
      );

      return results;
    }),
});

export type K8sRouter = typeof k8sRouter;
