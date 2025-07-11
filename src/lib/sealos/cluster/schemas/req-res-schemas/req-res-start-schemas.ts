import { z } from "zod";

// Cluster start request schema
export const ClusterStartRequestSchema = z.object({
  dbName: z.string().min(1, "Database name is required"),
  dbType: z.string().min(1, "Database type is required"),
});

// Cluster start response schema
export const ClusterStartResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.string(),
});

// Type exports
export type ClusterStartRequest = z.infer<typeof ClusterStartRequestSchema>;
export type ClusterStartResponse = z.infer<typeof ClusterStartResponseSchema>;
