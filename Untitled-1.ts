import z from "zod";

const clusterObjectSchema = z.object({
  name: z.string(),
  type: z.enum(["postgresql", "mongodb", "redis"]),
  version: z.string(),
  resource: z.object({
    cpu: z.enum(["1", "2", "4"]),
    memory: z.enum(["1Gi", "2Gi", "4Gi"]),
    storage: z.enum(["1Gi", "2Gi", "4Gi"]),
    replicas: z.number().min(1).max(3),
  }),
  status: z.enum(["running", "failed", "pending"]),
  createdAt: z.string(),
  uptime: z.string(),
  connection: z.object({
    privateConnection: z.object({
      endpoint: z.string(),
      host: z.string(),
      port: z.string(),
      username: z.string(),
      password: z.string(),
    }),
    publicConnection: z.string().optional(),
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
