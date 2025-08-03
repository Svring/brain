import { z } from "zod";
import { K8sResourceSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// Cluster backup list request schema
export const ClusterBackupListRequestSchema = z.object({
  dbName: z.string().min(1, "Database name is required"),
});

// Cluster backup list response schema
export const ClusterBackupListResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.array(K8sResourceSchema),
});

// Type exports
export type ClusterBackupListRequest = z.infer<typeof ClusterBackupListRequestSchema>;
export type ClusterBackupListResponse = z.infer<typeof ClusterBackupListResponseSchema>;