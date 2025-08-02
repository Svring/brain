import { z } from "zod";

export const ClusterResourceSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
  storage: z.string(),
  replicas: z.number(),
});

export const ClusterComponentSchema = z.object({
  name: z.string(),
  status: z.string(),
  resource: ClusterResourceSchema,
});

export const ClusterConnectionSchema = z.object({
  privateConnection: z.object({
    endpoint: z.string(),
    host: z.string(),
    port: z.string(),
    username: z.string(),
    password: z.string(),
  }),
});

export const ClusterBackupSchema = z
  .object({
    cronExpression: z.string(),
    enabled: z.boolean(),
    method: z.string(),
    pitrEnabled: z.boolean(),
    repoName: z.string(),
    retentionPeriod: z.string(),
  })
  .optional();

const PodSchema = z.object({
  name: z.string(),
  status: z.string(),
});

export const ClusterObjectSchema = z.object({
  name: z.string(),
  type: z.enum([
    "postgresql",
    "mongodb",
    "redis",
    "apecloud-mysql",
    "kafka",
    "milvus",
  ]),
  version: z.string(),
  status: z.string(),
  resource: ClusterResourceSchema,
  createdAt: z.string(),
  components: z.array(ClusterComponentSchema),
  connection: ClusterConnectionSchema,
  backup: ClusterBackupSchema.optional().nullable(),
  pods: z.array(PodSchema),
});

export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
export type ClusterComponent = z.infer<typeof ClusterComponentSchema>;
export type ClusterConnection = z.infer<typeof ClusterConnectionSchema>;
export type ClusterBackup = z.infer<typeof ClusterBackupSchema>;
export type ClusterObject = z.infer<typeof ClusterObjectSchema>;
