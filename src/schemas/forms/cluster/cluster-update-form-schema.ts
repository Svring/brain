import { z } from "zod";

// Use cluster resource update schema for updates
import { ClusterResourceUpdateSchema } from "./components/cluster-resource-schema";

// Update form schema (all fields optional for partial updates)
export const clusterUpdateFormSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  resource: ClusterResourceUpdateSchema.optional(),
});

export type ClusterUpdateFormData = z.infer<typeof clusterUpdateFormSchema>;
