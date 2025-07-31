import { z } from "zod";

export const ClusterObjectSchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["metadata.name"],
    })
  ),
  type: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["spec.clusterDefinitionRef"],
    })
  ),
  version: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["spec.clusterVersionRef"],
    })
  ),
  status: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["status.phase"],
    })
  ),
  resource: z.object({
    cpu: z.enum(["1", "2", "4"]),
    memory: z.enum(["1Gi", "2Gi", "4Gi"]),
    storage: z.enum(["1Gi", "2Gi", "4Gi"]),
    replicas: z.number().min(1).max(3),
  }),
  createdAt: z.string(),
  uptime: z.string(),
  components: z.array(
    z.object({
      name: z.string().describe(
        JSON.stringify({
          resourceType: "cluster",
          path: ["spec.componentSpecs", "name"],
        })
      ),
      replicas: z.number().describe(
        JSON.stringify({
          resourceType: "cluster",
          path: ["spec.componentSpecs", "replicas"],
        })
      ),
      cpu: z.string().describe(
        JSON.stringify({
          resourceType: "cluster",
          path: ["spec.componentSpecs", "resources.requests.cpu"],
        })
      ),
      memory: z.string().describe(
        JSON.stringify({
          resourceType: "cluster",
          path: ["spec.componentSpecs", "resources.requests.memory"],
        })
      ),
      storage: z
        .any()
        .describe(
          JSON.stringify({
            resourceType: "cluster",
            path: ["spec.componentSpecs", "volumeClaimTemplates"],
          })
        )
        .transform((data) => {
          // data is the volumeClaimTemplates array
          if (Array.isArray(data) && data.length > 0) {
            const firstTemplate = data[0];
            return firstTemplate?.spec?.resources?.requests?.storage || "";
          }
          return "";
        }),
    })
  ),
  connection: z.object({
    privateConnection: z.object({
      endpoint: z
        .string()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "{{instanceName}}-conn-credential$",
            path: ["data.endpoint"],
          })
        )
        .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
      host: z
        .string()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.host"],
          })
        )
        .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
      port: z
        .string()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.port"],
          })
        )
        .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
      username: z
        .string()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.username"],
          })
        )
        .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
      password: z
        .string()
        .describe(
          JSON.stringify({
            resourceType: "secret",
            label: "app.kubernetes.io/instance",
            name: "^{{instanceName}}-conn-credential$",
            path: ["data.password"],
          })
        )
        .transform((val) => Buffer.from(val, "base64").toString("utf-8")),
    }),
    publicConnection: z.string().optional(),
  }),
  backup: z.object({
    enabled: z.boolean(),
    schedule: z.string(),
    retention: z.string(),
    strategy: z.enum(["full", "incremental"]),
  }),
  pods: z
    .array(
      z.object({
        name: z.string(),
        uptime: z.string(),
        restartCount: z.number(),
        containers: z.array(
          z.object({
            name: z.string(),
            status: z.string(),
            startedAt: z.string(),
          })
        ),
      })
    )
    .optional(),
});

export type ClusterObject = z.infer<typeof ClusterObjectSchema>;
