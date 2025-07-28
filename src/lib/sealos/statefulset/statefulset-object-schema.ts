import { z } from "zod";

export const StatefulsetObjectSchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "statefulset",
      path: ["metadata.name"],
    })
  ),
  image: z.array(
    z.object({
      name: z.string().describe(
        JSON.stringify({
          resourceType: "statefulset",
          path: ["spec.template.spec.containers", "image"],
        })
      ),
    })
  ),
  status: z.object({
    replicas: z.number().describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["status.replicas"],
      })
    ),
    availableReplicas: z.number().describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["status.availableReplicas"],
      })
    ),
    unavailableReplicas: z.number().nullable().describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["status.unavailableReplicas"],
      })
    ).transform((data) => data || 0),
    readyReplicas: z.number().describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["status.readyReplicas"],
      })
    ),
    currentReplicas: z.number().describe(
      JSON.stringify({
        resourceType: "statefulset",
        path: ["status.currentReplicas"],
      })
    ),
  }),
  containers: z.array(
    z.object({
      name: z.string().describe(
        JSON.stringify({
          resourceType: "statefulset",
          path: ["spec.template.spec.containers", "name"],
        })
      ),
      image: z.string().describe(
        JSON.stringify({
          resourceType: "statefulset",
          path: ["spec.template.spec.containers", "image"],
        })
      ),
      command: z.any().describe(
        JSON.stringify({
          resourceType: "statefulset",
          path: ["spec.template.spec.containers", "command"],
        })
      ).transform((data) => {
        if (Array.isArray(data)) {
          return JSON.stringify(data);
        }
        return typeof data === "string" ? data : "";
      }),
      requests: z
        .object({
          cpu: z.string(),
          memory: z.string(),
        })
        .describe(
          JSON.stringify({
            resourceType: "statefulset",
            path: ["spec.template.spec.containers", "resources.requests"],
          })
        ),
      limits: z
        .object({
          cpu: z.string(),
          memory: z.string(),
        })
        .describe(
          JSON.stringify({
            resourceType: "statefulset",
            path: ["spec.template.spec.containers", "resources.limits"],
          })
        ),
      ports: z
        .any()
        .describe(
          JSON.stringify({
            resourceType: "statefulset",
            path: ["spec.template.spec.containers", "ports"],
          })
        )
        .transform((data) => {
          if (Array.isArray(data)) {
            return JSON.stringify(data);
          }
          return typeof data === "string" ? data : "";
        })
        .optional(),
      env: z
        .any()
        .describe(
          JSON.stringify({
            resourceType: "statefulset",
            path: ["spec.template.spec.containers", "env"],
          })
        )
        .transform((data) => {
          if (Array.isArray(data)) {
            return JSON.stringify(data);
          }
          return typeof data === "string" ? data : "";
        })
        .optional(),
    })
  ),
  volume: z.array(
    z.object({
      accessModes: z.array(z.string()).describe(
        JSON.stringify({
          resourceType: "statefulset",
          path: ["spec.volumeClaimTemplates", "spec.accessModes"],
        })
      ),
      storage: z.string().describe(
        JSON.stringify({
          resourceType: "statefulset",
          path: [
            "spec.volumeClaimTemplates",
            "spec.resources.requests.storage",
          ],
        })
      ),
      volumeMode: z.string().describe(
        JSON.stringify({
          resourceType: "statefulset",
          path: ["spec.volumeClaimTemplates", "spec.volumeMode"],
        })
      ),
    })
  ),
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
});

export type StatefulsetObject = z.infer<typeof StatefulsetObjectSchema>;
