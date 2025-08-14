import { z } from "zod";
import { K8sResourceSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

export const ObjectStorageOpenHostRequestSchema = z.object({
  bucket: z.string(),
});

export const ObjectStorageOpenHostResponseSchema = z.object({
  code: z.number(),
  statusText: z.string(),
  message: z.string(),
  data: z.array(K8sResourceSchema),
});

export type ObjectStorageOpenHostRequest = z.infer<
  typeof ObjectStorageOpenHostRequestSchema
>;
export type ObjectStorageOpenHostResponse = z.infer<
  typeof ObjectStorageOpenHostResponseSchema
>;
