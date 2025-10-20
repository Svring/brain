import { z } from "zod";
import {
	CPU_OPTIONS,
	MEMORY_OPTIONS,
	REPLICAS_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { createNumberUnionSchema } from "@/lib/sealos/sealos-utils";
import { ResourceSchema } from "../../universal/resource-schema";

// CPU options for cluster
export const CLUSTER_CPU_OPTIONS = CPU_OPTIONS;
export type ClusterCpuOption = (typeof CLUSTER_CPU_OPTIONS)[number];

// Extended memory options for cluster resources (includes 32 GB)
export const CLUSTER_MEMORY_OPTIONS = [...MEMORY_OPTIONS, 32] as const;
export type ClusterMemoryOption = (typeof CLUSTER_MEMORY_OPTIONS)[number];

// Full cluster resource schema (includes replicas for creation)
export const ClusterResourceSchema = ResourceSchema.extend({
	memory: createNumberUnionSchema(CLUSTER_MEMORY_OPTIONS),
	storage: z
		.number()
		.min(1, "Storage must be at least 0.1 GB")
		.max(300, "Storage must be at most 300 GB")
		.optional(),
	// .default(10),
});

// Cluster resource update schema (all fields optional for updates)
export const ClusterResourceUpdateSchema = z.object({
	replicas: createNumberUnionSchema(REPLICAS_OPTIONS).optional(),
	cpu: createNumberUnionSchema(CLUSTER_CPU_OPTIONS).optional(),
	memory: createNumberUnionSchema(CLUSTER_MEMORY_OPTIONS).optional(),
	storage: z
		.number()
		.min(1, "Storage must be at least 0.1 GB")
		.max(300, "Storage must be at most 300 GB")
		.optional(),
});

export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
export type ClusterResourceUpdate = z.infer<typeof ClusterResourceUpdateSchema>;
