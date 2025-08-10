import { z } from "zod";
import { K8sResourceSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// Cluster delete request schema
export const ClusterDeleteRequestSchema = z.object({
  name: z.string().min(1, "Database name is required"),
});

// Cluster delete response schema
export const ClusterDeleteResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: K8sResourceSchema,
});

// Type exports
export type ClusterDeleteRequest = z.infer<typeof ClusterDeleteRequestSchema>;
export type ClusterDeleteResponse = z.infer<typeof ClusterDeleteResponseSchema>;
