import { z } from "zod";

export const DevboxObjectPortSchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.config.appPorts", "name"],
    })
  ),
  number: z.number().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.config.appPorts", "port"],
    })
  ),
  protocol: z.string().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.config.appPorts", "protocol"],
    })
  ),
  publicDomain: z.string().optional(),
});

export type DevboxObjectPort = z.infer<typeof DevboxObjectPortSchema>;

export const DevboxObjectSchema = z.object({
  name: z.string().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["metadata.name"],
    })
  ),
  image: z.string().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["spec.image"],
    })
  ),
  status: z.string().describe(
    JSON.stringify({
      resourceType: "devbox",
      path: ["status.phase"],
    })
  ),
  resources: z.object({
    cpu: z.string().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.resource.cpu"],
      })
    ),
    memory: z.string().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.resource.memory"],
      })
    ),
  }),
  ssh: z.object({
    host: z
      .string()
      .nullable()
      .describe(
        JSON.stringify({
          resourceType: "external",
          note: "current cluster's domain name",
        })
      ),
    port: z.union([z.string(), z.number()]).describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["status.network.nodePort"],
      })
    ),
    user: z.string().describe(
      JSON.stringify({
        resourceType: "devbox",
        path: ["spec.config.user"],
      })
    ),
    privateKey: z.string().describe(
      JSON.stringify({
        resourceType: "secret",
        path: ["data.SEALOS_DEVBOX_PRIVATE_KEY"],
      })
    ),
  }),
  ports: z.array(DevboxObjectPortSchema),
  env: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  pods: z
    .array(
      z.object({
        name: z.string(),
      })
    )
    .optional(),
});

export type DevboxObject = z.infer<typeof DevboxObjectSchema>;
