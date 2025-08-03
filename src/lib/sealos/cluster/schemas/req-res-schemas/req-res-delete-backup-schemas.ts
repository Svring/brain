import { z } from "zod";
import { K8sResourceSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

export const ClusterBackupDeleteRequestSchema = z.object({
  backupName: z.string(),
});

export const ClusterBackupDeleteResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: K8sResourceSchema,
});

export type ClusterBackupDeleteRequest = z.infer<
  typeof ClusterBackupDeleteRequestSchema
>;
export type ClusterBackupDeleteResponse = z.infer<
  typeof ClusterBackupDeleteResponseSchema
>;
