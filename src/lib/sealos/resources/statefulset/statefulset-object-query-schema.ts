import { z } from "zod";
import type { Env } from "@/schemas/forms/universal/env-schema";
import { convertK8sResourceToNumeric } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  formatIsoDateToReadable,
  formatUnixTimeToReadable,
  getCurrentTimezoneInfo,
  getCurrentUnixTime,
} from "@/lib/date/date-utils";
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
      JSON.stringify([
        {
          resourceType: "statefulset",
          path: ["spec.template.spec.containers"],
        },
        {
          resourceType: "secret",
          path: ["data"],
        },
      ])
    )
    .transform((resources) => {
      if (!Array.isArray(resources) || resources.length < 2) {
        return {
          imageName: "",
          imageRegistry: null,
        };
      }

      const [containers, secretData] = resources;

      // Extract image name from containers
      let imageName = "";
      if (Array.isArray(containers) && containers.length > 0) {
        imageName = containers[0].image || "";
      }

      // Extract registry information from secret data
      let imageRegistry = null;
      if (secretData && secretData[".dockerconfigjson"]) {
        try {
          // Decode the base64 encoded docker config
          const dockerConfigJson = Buffer.from(
            secretData[".dockerconfigjson"],
            "base64"
          ).toString("utf-8");

          const dockerConfig = JSON.parse(dockerConfigJson);

          // Extract registry information from auths
          if (dockerConfig.auths && typeof dockerConfig.auths === "object") {
            const serverAddresses = Object.keys(dockerConfig.auths);

            if (serverAddresses.length > 0) {
              const serverAddress = serverAddresses[0];
              const authInfo = dockerConfig.auths[serverAddress];

              imageRegistry = {
                serverAddress,
                username: authInfo.username || "",
                password: authInfo.password || "",
              };
            }
          }
        } catch (error) {
          console.error("Error parsing docker config:", error);
        }
      }

      return {
        imageName,
        imageRegistry,
      };
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
      if (!spec) return {};

      const replicas = spec.replicas;
      const containers = spec.template?.spec?.containers;
      const volumeClaimTemplates = spec.volumeClaimTemplates;

      // Extract storage request from the first volumeClaimTemplate
      const storage =
        Array.isArray(volumeClaimTemplates) && volumeClaimTemplates.length > 0
          ? volumeClaimTemplates[0].spec?.resources?.requests?.storage || ""
          : "";

      if (Array.isArray(containers) && containers.length > 0) {
        const limits = containers[0].resources?.limits || {};
        const k8sResource = {
          replicas,
          ...limits,
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
      if (!resource) return "Unknown";

      const status = resource.status || {};
      const paused =
        resource.metadata?.annotations?.["deploy.cloud.sealos.io/pause"];
      const statusObject = {
        replicas: status.replicas || 0,
        readyReplicas: status.readyReplicas || 0,
        unavailableReplicas: status.unavailableReplicas || 0,
        availableReplicas: status.availableReplicas || 0,
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
      if (!resource) return { createdAt: "Unknown" };

      const metadata = resource.metadata || {};

      // Get current timezone info and log it
      const currentTimezoneInfo = getCurrentTimezoneInfo();
      console.log("Current timezone info:", currentTimezoneInfo);

      // Get current Unix time for testing
      const currentUnixTime = getCurrentUnixTime();
      console.log("Current Unix time:", currentUnixTime);

      // Test different timezones with the creation timestamp
      const creationTimestamp = metadata.creationTimestamp;
      if (creationTimestamp) {
        console.log("Original creation timestamp:", creationTimestamp);

        // Test 5 different timezones
        const testTimezones = [
          "UTC",
          "America/New_York",
          "Europe/London",
          "Asia/Tokyo",
          "Australia/Sydney",
        ];

        console.log("=== Timezone Conversion Tests ===");

        // Test with ISO date string
        testTimezones.forEach((timezone) => {
          try {
            const formattedDate = formatIsoDateToReadable(
              creationTimestamp,
              "yyyy-MM-dd HH:mm:ss"
            );
            console.log(`${timezone}: ${formattedDate}`);
          } catch (error) {
            console.error(`Error formatting for ${timezone}:`, error);
          }
        });

        // Test with Unix timestamp (convert ISO to Unix first)
        const unixTimestamp = Math.floor(
          new Date(creationTimestamp).getTime() / 1000
        );
        console.log("Converted Unix timestamp:", unixTimestamp);

        testTimezones.forEach((timezone) => {
          try {
            const formattedUnixDate = formatUnixTimeToReadable(
              unixTimestamp,
              timezone,
              "yyyy-MM-dd HH:mm:ss"
            );
            console.log(`Unix ${timezone}: ${formattedUnixDate}`);
          } catch (error) {
            console.error(`Error formatting Unix for ${timezone}:`, error);
          }
        });
      }

      // Get createdAt from metadata and format it (default behavior)
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
    .transform((containers) => {
      if (Array.isArray(containers) && containers.length > 0) {
        const env = containers[0].env;
        if (!Array.isArray(env)) return [];

        return env.map((envVar: any) => {
          if (envVar.value) {
            // Direct value environment variable
            return {
              name: envVar.name,
              value: envVar.value,
            };
          } else if (envVar.valueFrom?.secretKeyRef) {
            // Secret reference environment variable
            return {
              name: envVar.name,
              valueFrom: {
                secretKeyRef: {
                  name: envVar.valueFrom.secretKeyRef.name,
                  key: envVar.valueFrom.secretKeyRef.key,
                },
              },
            };
          } else {
            // Unknown type, return as value with placeholder
            return {
              name: envVar.name,
              value: `[UNKNOWN_ENV_TYPE: ${JSON.stringify(envVar)}]`,
            };
          }
        });
      }
      return [];
    })
    .optional(),
  ports: z.any().optional(),
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
    .any()
    .describe(
      JSON.stringify([
        {
          resourceType: "statefulset",
          path: ["spec.template.spec.containers"],
        },
        {
          resourceType: "configmap",
        },
      ])
    )
    .transform((resources) => {
      if (!Array.isArray(resources) || resources.length < 2) {
        return [];
      }

      const [containers, configmap] = resources;

      if (!Array.isArray(containers) || containers.length === 0) {
        return [];
      }
      const container = containers[0];
      if (!container?.volumeMounts) {
        return [];
      }

      if (!configmap?.data) {
        return [];
      }

      const result = container.volumeMounts
        .filter((mount: any) => mount.subPath) // Only include mounts with subPath
        .map((mount: any) => ({
          path: mount.mountPath,
          content: configmap.data[mount.subPath] || "",
        }));

      return result;
    })
    .optional(),
  localStorage: z
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
      if (!Array.isArray(pods)) return [];

      return pods.map((pod: any) => {
        return {
          name: pod.metadata?.name || "",
          status: pod.status?.phase || "Unknown",
          containers:
            pod.status?.containerStatuses?.map((container: any) => ({
              name: container.name,
              ready: container.ready,
              state: container.state,
              restartCount: container.restartCount,
            })) || [],
        };
      });
    }),
});

export type StatefulsetObjectQuery = z.infer<
  typeof StatefulsetObjectQuerySchema
>;
