import { z } from "zod";
import { K8sResourceSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

export const ObjectStorageStatusRequestSchema = z.object({
  bucket: z.string(),
});

export const ObjectStorageStatusResponseSchema = z.object({
  code: z.number(),
  statusText: z.string(),
  message: z.string(),
  data: z.array(K8sResourceSchema),
});

export type ObjectStorageStatusRequest = z.infer<
  typeof ObjectStorageStatusRequestSchema
>;
export type ObjectStorageStatusResponse = z.infer<
  typeof ObjectStorageStatusResponseSchema
>;
