import { z } from "zod";

// Auto backup schema
export const AutoBackupSchema = z.object({
  start: z.boolean(),
  type: z.string(), // e.g., "day"
  week: z.array(z.string()).default([]),
  hour: z.string(),
  minute: z.string(),
  saveTime: z.number(),
  saveType: z.string(), // e.g., "d" for days
});

// DB form schema
export const DbFormSchema = z.object({
  dbType: z.string(), // e.g., "kafka"
  dbVersion: z.string(), // e.g., "kafka-3.3.2"
  dbName: z.string().min(1, "Database name is required"),
  replicas: z.number().min(1),
  cpu: z.number().min(0), // CPU in millicores
  memory: z.number().min(0), // Memory in MB
  storage: z.number().min(0), // Storage in GB
  labels: z.record(z.string()).default({}),
  autoBackup: AutoBackupSchema,
  terminationPolicy: z.enum(["Delete", "Retain"]),
});

// Cluster create request schema
export const ClusterCreateRequestSchema = z.object({
  dbForm: DbFormSchema,
  isEdit: z.boolean().default(false),
});

// Cluster create response schema
export const ClusterCreateResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.string(),
});

// Type exports
export type AutoBackup = z.infer<typeof AutoBackupSchema>;
export type DbForm = z.infer<typeof DbFormSchema>;
export type ClusterCreateRequest = z.infer<typeof ClusterCreateRequestSchema>;
export type ClusterCreateResponse = z.infer<typeof ClusterCreateResponseSchema>;
