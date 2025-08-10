import { z } from "zod";

// Cluster pause request schema
export const ClusterPauseRequestSchema = z.object({
  dbName: z.string().min(1, "Database name is required"),
  dbType: z.string().min(1, "Database type is required"),
});

// Cluster pause response schema
export const ClusterPauseResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.string(),
});

// Type exports
export type ClusterPauseRequest = z.infer<typeof ClusterPauseRequestSchema>;
export type ClusterPauseResponse = z.infer<typeof ClusterPauseResponseSchema>;
