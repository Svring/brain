import { z } from "zod";

export const ClusterObjectMutationSchema = z.object({
  name: z.string(),
  type: z.enum(["postgresql", "mongodb", "redis"]),
  version: z.string(),
  resource: z.object({
    cpu: z.enum(["1", "2", "4"]),
    memory: z.enum(["1Gi", "2Gi", "4Gi"]),
    storage: z.enum(["1Gi", "2Gi", "4Gi"]),
    replicas: z.number().min(1).max(3),
  }),
  backup: z
    .object({
      terminationPolicy: z.enum(["Delete", "Retain"]),
      schedule: z.string(),
      retention: z.number().default(7),
    })
    .optional(),
});
