import { z } from "zod";
import { ClusterResourceSchema } from "@/schemas/forms/cluster/components/cluster-resource-schema";

// Runtime schema for Copilot update parameters (clusterName, optional resource)
export const ClusterUpdateRuntimeSchema = z.object({
  clusterName: z.string().min(1, "Cluster name is required"),
  resource: ClusterResourceSchema.optional(),
});

export type ClusterUpdateRuntime = z.infer<typeof ClusterUpdateRuntimeSchema>;
