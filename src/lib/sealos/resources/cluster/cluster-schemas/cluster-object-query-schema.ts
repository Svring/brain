import { z } from "zod";
import { transformComponentSpecsToResources } from "../cluster-utils";

export const ClusterObjectQuerySchema = z.object({
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
  resource: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "cluster",
        path: ["spec.componentSpecs"],
      })
    )
    .transform((data) => transformComponentSpecsToResources(data)),
  createdAt: z.string().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["metadata.creationTimestamp"],
    })
  ),
  uptime: z.any().optional(),
  components: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "cluster",
        path: [""],
      })
    )
    .transform((resourece) => {
      const componentSpecs = resourece.spec.componentSpecs;
      const statusComponents = resourece.status?.components;
      if (!Array.isArray(componentSpecs)) return [];

      return componentSpecs.map((spec) => ({
        name: spec.name,
        status: statusComponents?.[spec.name]?.phase || "unknown",
        resource: {
          cpu:
            spec.resources?.limits?.cpu || spec.resources?.requests?.cpu || "0",
          memory:
            spec.resources?.limits?.memory ||
            spec.resources?.requests?.memory ||
            "0",
          storage:
            spec.volumeClaimTemplates?.[0]?.spec?.resources?.requests
              ?.storage || "0",
          replicas: spec.replicas || 0,
        },
      }));
    }),
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
  backup: z.any().describe(
    JSON.stringify({
      resourceType: "cluster",
      path: ["spec.backup"],
    })
  ),
  pods: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "pod",
        label: "app.kubernetes.io/instance",
      })
    )
    .transform((pods) => {
      return pods.map((pod: any) => {
        return {
          name: pod.metadata.name,
          status: pod.status.phase,
        };
      });
    })
    .optional(),
});

export type ClusterObjectQuery = z.infer<typeof ClusterObjectQuerySchema>;
