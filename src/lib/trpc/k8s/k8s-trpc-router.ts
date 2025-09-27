import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { K8sContext } from "./k8s-trpc-context";
import {
  CustomResourceTargetSchema,
  BuiltinResourceTargetSchema,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  listAllResources,
  getResource,
  listAnnotationBasedResources,
  listEventsQuery,
  getEventsByPodQuery,
  getPodLogsQuery,
} from "@/lib/k8s/k8s-method/k8s-query";
import { listBuiltinResourcesDirect } from "@/lib/k8s/k8s-api/k8s-api-query";
import { getResourceQuota } from "@/lib/sealos/resources/resource-quota/resource-quota-api/resource-quota-api-service";
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

// Type definitions
export type PodEventsResult = {
  podName: string | undefined;
  podTarget: BuiltinResourceTarget;
  events: any[];
  success: boolean;
  error?: string;
};

export type PodEventsRecord = Record<
  string,
  {
    events: any[];
    success: boolean;
    error?: string;
  }
>;

// Example of PodEventsRecord structure:
// {
//   "pod-1": { events: [...], success: true },
//   "pod-2": { events: [...], success: true },
//   "pod-3": { events: [], success: false, error: "Pod not found" }
// }

export type PodLogsResult = {
  podName: string;
  logs: string;
  success: boolean;
  error?: string;
};

export type PodLogsRecord = Record<
  string,
  {
    logs: string;
    success: boolean;
    error?: string;
  }
>;

// Example of PodLogsRecord structure:
// {
//   "pod-1": { logs: "...", success: true },
//   "pod-2": { logs: "...", success: true },
//   "pod-3": { logs: "", success: false, error: "Pod not found" }
// }

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

  // Resource Quota Management
  resourceQuota: t.procedure.query(async ({ ctx }) => {
    return await getResourceQuota(ctx);
  }),

  // Pod Events Management
  /**
   * Get events for multiple pods in parallel.
   * Returns data in record format where key is pod name and value is events list.
   *
   * @example
   * ```typescript
   * const podEvents = await trpc.k8s.podEvents.query({
   *   podTargets: [
   *     { type: "builtin", resourceType: "pod", name: "pod-1" },
   *     { type: "builtin", resourceType: "pod", name: "pod-2" }
   *   ]
   * });
   * // Returns: { "pod-1": { events: [...], success: true }, "pod-2": { events: [...], success: true } }
   * ```
   */
  podEvents: t.procedure
    .input(
      z.object({
        podTargets: z.array(BuiltinResourceTargetSchema),
      })
    )
    .query(async ({ ctx, input }): Promise<PodEventsRecord> => {
      const { podTargets } = input;

      // Filter to only include pod resource types
      const podTargetsFiltered = podTargets.filter(
        (target) => target.resourceType === "pod"
      );

      if (podTargetsFiltered.length === 0) {
        return {};
      }

      // Get events for each pod in parallel
      const eventsPromises = podTargetsFiltered.map(async (podTarget) => {
        try {
          const events = await getEventsByPodQuery(ctx, podTarget.name!);
          return {
            podName: podTarget.name!,
            events: events.items,
            success: true,
          };
        } catch (error) {
          console.warn(
            `Failed to fetch events for pod ${podTarget.name}:`,
            error
          );
          return {
            podName: podTarget.name!,
            events: [],
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(eventsPromises);

      // Convert array to record format
      const eventsRecord: PodEventsRecord = {};
      results.forEach((result) => {
        if (result.podName) {
          eventsRecord[result.podName] = {
            events: result.events,
            success: result.success,
            error: result.error,
          };
        }
      });

      return eventsRecord;
    }),

  // Pod Management
  /**
   * Get all pods for a specific resource target.
   * Uses appropriate label selectors based on resource type.
   *
   * @example
   * ```typescript
   * const pods = await trpc.k8s.pods.query({
   *   target: { type: "custom", resourceType: "devbox", group: "devbox.sealos.io", version: "v1", plural: "devboxes", name: "my-devbox" }
   * });
   * // Returns: { pods: [{ name: "pod-1", status: "Running" }], success: true }
   * ```
   */
  pods: t.procedure
    .input(
      z.object({
        target: z.union([
          CustomResourceTargetSchema,
          BuiltinResourceTargetSchema,
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      const { target } = input;

      try {
        // Get the resource object first to determine the resource type
        const resource = await getResource(ctx, target);

        // Determine the appropriate label selector based on resource type
        let labelSelector: string;

        if (target.type === "custom") {
          switch (target.resourceType) {
            case "devbox":
              labelSelector = `app.kubernetes.io/name=${target.name}`;
              break;
            case "cluster":
              labelSelector = `app.kubernetes.io/instance=${target.name}`;
              break;
            default:
              // Generic fallback for unknown custom resources
              labelSelector = `app=${target.name}`;
          }
        } else {
          // Builtin resources (deployment, statefulset, etc.)
          switch (target.resourceType) {
            case "deployment":
            case "statefulset":
              labelSelector = `app=${target.name}`;
              break;
            default:
              // Generic fallback for unknown builtin resources
              labelSelector = `app=${target.name}`;
          }
        }

        // Get pods using the label selector
        const podTarget = {
          type: "builtin" as const,
          resourceType: "pod" as const,
          labelSelector,
        };

        const podList = await listBuiltinResourcesDirect(ctx, podTarget);

        return {
          pods: podList.items || [],
          success: true,
        };
      } catch (error) {
        console.warn(
          `Failed to fetch pods for resource ${target.name}:`,
          error
        );
        return {
          pods: [],
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Pod Logs Management
  /**
   * Get logs for multiple pods in parallel.
   * Returns data in record format where key is pod name and value is logs data.
   *
   * @example
   * ```typescript
   * const podLogs = await trpc.k8s.podLogs.query({
   *   podNames: ["pod-1", "pod-2"],
   *   options: {
   *     container: "main",
   *     tailLines: 100,
   *     timestamps: true
   *   }
   * });
   * // Returns: { "pod-1": { logs: "...", success: true }, "pod-2": { logs: "...", success: true } }
   * ```
   */
  podLogs: t.procedure
    .input(
      z.object({
        podNames: z.array(z.string()),
        options: z
          .object({
            container: z.string().optional(),
            tailLines: z.number().optional(),
            follow: z.boolean().optional(),
            previous: z.boolean().optional(),
            sinceSeconds: z.number().optional(),
            timestamps: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }): Promise<PodLogsRecord> => {
      const { podNames, options = {} } = input;

      if (podNames.length === 0) {
        return {};
      }

      // Get logs for each pod in parallel
      const logsPromises = podNames.map(async (podName) => {
        try {
          const logs = await getPodLogsQuery(ctx, podName, options);
          return {
            podName,
            logs,
            success: true,
          };
        } catch (error) {
          console.warn(`Failed to fetch logs for pod ${podName}:`, error);
          return {
            podName,
            logs: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(logsPromises);

      // Convert array to record format
      const logsRecord: PodLogsRecord = {};
      results.forEach((result) => {
        logsRecord[result.podName] = {
          logs: result.logs,
          success: result.success,
          error: result.error,
        };
      });

      return logsRecord;
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
