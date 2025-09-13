import { z } from "zod";
import { K8sResourceSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// Cluster delete request schema - extends CustomResourceTarget but requires name
export const ClusterDeleteRequestSchema = CustomResourceTargetSchema.extend({
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
