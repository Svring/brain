import { z } from "zod";
import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";
import { convertK8sResourceToNumeric } from "@/lib/k8s/k8s-method/k8s-utils";
import { formatIsoDateToReadable } from "@/lib/date/date-utils";
import { determineLaunchpadStatus } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-utils";

export const DeploymentObjectQuerySchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "deployment",
      path: ["metadata.name"],
    })
  ),
  kind: z.string().describe(
    JSON.stringify({
      resourceType: "deployment",
      path: ["kind"],
    })
  ),
  image: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
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
        resourceType: "deployment",
        path: ["spec"],
      })
    )
    .transform((spec) => {
      const replicas = spec.replicas;
      const containers = spec.template.spec.containers;
      if (Array.isArray(containers) && containers.length > 0) {
        const k8sResource = {
          replicas,
          ...containers[0].resources.limits,
        };

        // Convert Kubernetes resource strings to numeric values
        const convertedResource = convertK8sResourceToNumeric({
          cpu: k8sResource.cpu,
          memory: k8sResource.memory,
        });

        return {
          replicas,
          cpu: convertedResource.cpu.original,
          memory: convertedResource.memory.original,
        };
      }
      return {};
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
  status: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
        path: [""],
      })
    )
    .transform((resource) => {
      const status = resource.status;
      console.log("status", status);
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
  operationalStatus: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "deployment",
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
        resourceType: "deployment",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        const env = containers[0].env;
        if (!Array.isArray(env)) return [];

        return env.map((envVar: any) => {
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
        resourceType: "deployment",
        path: ["spec.template.spec.containers"],
      })
    )
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        return containers[0].ports.map((port: { containerPort: number }) => ({
          number: port.containerPort,
        }));
      }
      return [];
    })
    .optional(),
  configMap: z
    .array(
      z.object({
        name: z.string(),
        path: z.string(),
      })
    )
    .optional(),
  localStorage: z
    .array(
      z.object({
        name: z.string(),
        path: z.string(),
      })
    )
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
          status: pod.status.containerStatuses[0].ready ? "Running" : "Waiting",
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

export type DeploymentObjectQuery = z.infer<typeof DeploymentObjectQuerySchema>;
