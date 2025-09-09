import { z } from "zod";
import { ResourceSchema } from "../../universal/resource-schema";
import { MEMORY_OPTIONS } from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { createNumberUnionSchema } from "@/lib/sealos/sealos-utils";

// Extended memory options for cluster resources (includes 32 GB)
const CLUSTER_MEMORY_OPTIONS = [...MEMORY_OPTIONS, 32] as const;

export const ClusterResourceSchema = ResourceSchema.extend({
  memory: createNumberUnionSchema(CLUSTER_MEMORY_OPTIONS),
  storage: z
    .number()
    .min(1, "Storage must be at least 0.1 GB")
    .max(300, "Storage must be at most 300 GB")
    .default(10),
});

export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
