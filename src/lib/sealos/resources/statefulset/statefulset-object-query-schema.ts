import { z } from "zod";
import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";
import { convertK8sResourceToNumeric } from "@/lib/k8s/k8s-method/k8s-utils";
import { formatIsoDateToReadable } from "@/lib/date/date-utils";
import { determineLaunchpadStatus } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-utils";

export const StatefulsetObjectQuerySchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "statefulset",
      path: ["metadata.name"],
    })
  ),
  kind: z.string().describe(
    JSON.stringify({
      resourceType: "statefulset",
      path: ["kind"],
    })
  ),
  image: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        return containers[0].image;
      }
      return "";
    }),
  resource: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["spec"],
      })
    )
    .transform((spec) => {
      const replicas = spec.replicas;
      const containers = spec.template.spec.containers;
      const volumeClaimTemplates = spec.volumeClaimTemplates;

      // Extract storage request from the first volumeClaimTemplate
      const storage =
        Array.isArray(volumeClaimTemplates) && volumeClaimTemplates.length > 0
          ? volumeClaimTemplates[0].spec?.resources?.requests?.storage || ""
          : "";

      if (Array.isArray(containers) && containers.length > 0) {
        const k8sResource = {
          replicas,
          ...containers[0].resources.limits,
          storage,
        };

        // Convert Kubernetes resource strings to numeric values
        const convertedResource = convertK8sResourceToNumeric({
          cpu: k8sResource.cpu,
          memory: k8sResource.memory,
          storage: k8sResource.storage,
        });

        return {
          replicas,
          cpu: convertedResource.cpu.original,
          memory: convertedResource.memory.original,
          storage: convertedResource.storage.original,
        };
      }
      // Convert storage even when no containers are found
      const convertedStorage = convertK8sResourceToNumeric({
        storage: storage,
      });

      return {
        replicas,
        storage: convertedStorage.storage.original,
      };
    }),
  status: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: [""],
      })
    )
    .transform((resource) => {
      const status = resource.status;
      const paused =
        resource.metadata.annotations?.["deploy.cloud.sealos.io/pause"];
      const statusObject = {
        replicas: status.replicas,
        readyReplicas: status.readyReplicas,
        unavailableReplicas: status.unavailableReplicas,
        availableReplicas: status.availableReplicas,
        paused: paused ? true : false,
      };

      return determineLaunchpadStatus(statusObject);
    }),
  strategy: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "hpa",
        path: ["spec"],
      })
    )
    .transform((strategy) => {
      if (!strategy) {
        return { type: "fixed" };
      }

      // Extract threshold information from metrics
      const threshold =
        strategy.metrics && strategy.metrics.length > 0
          ? {
              resource: strategy.metrics[0].resource.name,
              usage:
                strategy.metrics[0].resource.target.averageUtilization / 10,
            }
          : null;

      return {
        type: "flexible",
        minReplicas: strategy.minReplicas,
        maxReplicas: strategy.maxReplicas,
        threshold,
      };
    }),
  operationalStatus: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: [""],
      })
    )
    .transform((resource) => {
      const metadata = resource.metadata;

      // Get createdAt from metadata and format it
      const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

      return {
        createdAt,
      };
    }),
  env: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers): EnvVar[] => {
      if (Array.isArray(containers) && containers.length > 0) {
        const env = containers[0].env;
        if (!Array.isArray(env)) return [];

        return env.map((envVar: any): EnvVar => {
          if (envVar.value) {
            // Direct value environment variable
            return {
              type: "value" as const,
              name: envVar.name,
              value: envVar.value,
            };
          } else if (envVar.valueFrom?.secretKeyRef) {
            // Secret reference environment variable
            return {
              type: "secretKeyRef" as const,
              name: envVar.name,
              secretName: envVar.valueFrom.secretKeyRef.name,
              secretKey: envVar.valueFrom.secretKeyRef.key,
            };
          } else {
            // Unknown type, return as value with placeholder
            return {
              type: "value" as const,
              name: envVar.name,
              value: `[UNKNOWN_ENV_TYPE: ${JSON.stringify(envVar)}]`,
            };
          }
        });
      }
      return [];
    })
    .optional(),
  ports: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        return (
          containers[0].ports?.map((port: { containerPort: number }) => ({
            number: port.containerPort,
          })) || []
        );
      }
      return [];
    })
    .optional(),
  launchCommand: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        const container = containers[0];
        return {
          command: container.command || [],
          args: container.args || [],
        };
      }
      return {
        command: [],
        args: [],
      };
    }),
  configMap: z
    .array(
      z.object({
        name: z.string(),
        path: z.string(),
      })
    )
    .optional(),
  volume: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "pvc",
        label: "app",
      })
    )
    .transform((pvcs) => {
      if (!Array.isArray(pvcs)) return [];

      return pvcs.map((pvc: any) => {
        const annotations = pvc.metadata?.annotations || {};
        return {
          path: annotations.path || "",
          value: annotations.value || "",
        };
      });
    })
    .optional(),
  pods: z
    .any()
    .optional()
    .describe(
      JSON.stringify({
        resourceType: "pod",
        label: "app",
      })
    )
    .transform((pods) => {
      return pods.map((pod: any) => {
        return {
          name: pod.metadata.name,
          status: pod.status.phase,
          containers: pod.status.containerStatuses.map((container: any) => ({
            name: container.name,
            ready: container.ready,
            state: container.state,
            restartCount: container.restartCount,
          })),
        };
      });
    }),
});

export type StatefulsetObjectQuery = z.infer<
  typeof StatefulsetObjectQuerySchema
>;
