import { z } from "zod";

// Reuse cluster resource schema
import { ClusterResourceSchema } from "./components/cluster-resource-schema";

// Update form schema (all fields optional for partial updates)
export const clusterUpdateFormSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  resource: ClusterResourceSchema.optional(),
});

export type ClusterUpdateFormData = z.infer<typeof clusterUpdateFormSchema>;
