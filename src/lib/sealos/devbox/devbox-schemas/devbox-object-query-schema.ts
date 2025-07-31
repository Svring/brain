import { z } from "zod";

export const DevboxObjectQuerySchema = z.object({
  name: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["metadata.name"],
    })
  ),
  image: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.image"],
    })
  ),
  status: z.any().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["status.phase"],
    })
  ),
  resources: z.object({
    cpu: z.any().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.resource.cpu"],
      })
    ),
    memory: z.any().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.resource.memory"],
      })
    ),
  }),
  ssh: z.object({
    host: z
      .any()
      .nullable()
      .describe(
        JSON.stringify({
          resourceType: "external",
          note: "current cluster's domain name",
        })
      ),
    port: z.any().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["status.network.nodePort"],
      })
    ),
    user: z.any().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.config.user"],
      })
    ),
    privateKey: z
      .any()
      .describe(
        JSON.stringify({
          resourceType: "secret",
          path: ["data.SEALOS_DEVBOX_PRIVATE_KEY"],
        })
      )
      .transform((val) => Buffer.from(val, "base64").toString("utf-8"))
      .optional(),
  }),
  ports: z
    .any()
    .describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.network.extraPorts"],
      })
    )
    .transform((extraPorts) => {
      if (Array.isArray(extraPorts) && extraPorts.length > 0) {
        return extraPorts.map((port: { containerPort: number }) => ({
          number: port.containerPort,
        }));
      }
      return [];
    }),
  pods: z.array(z.any()).optional(),
});

export type DevboxObjectQuery = z.infer<typeof DevboxObjectQuerySchema>;
