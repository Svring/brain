import { z } from "zod";

export const ClusterResourceSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
  storage: z.string(),
  replicas: z.number(),
});

export const ClusterComponentSchema = z.object({
  name: z.string(),
  status: z.string().nullable(),
  resource: ClusterResourceSchema,
});

export const ClusterConnectionSchema = z.object({
  privateConnection: z.object({
    endpoint: z.string(),
    host: z.string(),
    port: z.string(),
    username: z.string(),
    password: z.string(),
    connectionString: z.string(),
  }),
  publicConnection: z
    .object({
      port: z.number(),
      connectionString: z.string(),
    })
    .nullable()
    .optional(),
});

export const ClusterBackupSchema = z
  .object({
    cronExpression: z.string().optional(),
    enabled: z.boolean().optional(),
    method: z.string().optional(),
    pitrEnabled: z.boolean().optional(),
    repoName: z.string().optional(),
    retentionPeriod: z.string().optional(),
  })
  .optional();

export const PodSchema = z.object({
  name: z.string(),
  status: z.string(),
  upTime: z.string().optional(),
  containers: z.any(),
});

export const ClusterObjectSchema = z.object({
  name: z.string(),
  kind: z.string(),
  type: z.enum([
    "postgresql",
    "mongodb",
    "redis",
    "apecloud-mysql",
    "kafka",
    "milvus",
  ]),
  version: z.string(),
  operationalStatus: z.any().optional(),
  status: z.string().nullable(),
  resource: ClusterResourceSchema,
  components: z.array(ClusterComponentSchema).optional().nullable(),
  connection: ClusterConnectionSchema,
  backup: ClusterBackupSchema.optional().nullable(),
  pods: z.array(PodSchema).optional().nullable(),
});

export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
export type ClusterComponent = z.infer<typeof ClusterComponentSchema>;
export type ClusterConnection = z.infer<typeof ClusterConnectionSchema>;
export type ClusterBackup = z.infer<typeof ClusterBackupSchema>;
export type ClusterObject = z.infer<typeof ClusterObjectSchema>;
export type Pod = z.infer<typeof PodSchema>;
