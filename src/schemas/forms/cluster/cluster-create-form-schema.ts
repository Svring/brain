import { z } from "zod";
import { nanoid } from "@/lib/utils";
import { NameSchema } from "@/schemas/forms/universal/name-schema";
import { ClusterResourceSchema } from "./components/cluster-resource-schema";
import { ClusterTerminationPolicySchema } from "./components/cluster-termination-policy-schema";
import { ClusterTypeSchema } from "./components/cluster-type-schema";
import { ClusterVersionSchema } from "./components/cluster-version-schema";

// Main cluster create form schema
export const clusterCreateFormSchema = z
	.object({
		name: NameSchema.default(() => `cluster-${nanoid()}`),
		type: ClusterTypeSchema.default("postgresql"),
		version: ClusterVersionSchema.default("postgresql-14.8.0"),
		resource: ClusterResourceSchema.default({
			replicas: 1,
			cpu: 0.5,
			memory: 0.5,
			storage: 1,
		}),
		terminationPolicy: ClusterTerminationPolicySchema.default("Delete"),
	})
	.transform((data) => {
		// Set higher defaults for milvus, clickhouse, and kafka
		const highResourceTypes = ["milvus", "clickhouse", "kafka"];
		const type = data.type?.toLowerCase() || "";

		if (highResourceTypes.includes(type) && data.resource) {
			// Check if values match the default (0.5, 0.5, 1) - meaning they weren't explicitly set
			const isUsingDefaults =
				data.resource.cpu === 0.5 &&
				data.resource.memory === 0.5 &&
				data.resource.storage === 1;

			if (isUsingDefaults) {
				return {
					...data,
					resource: {
						...data.resource,
						cpu: 2,
						memory: 2,
						storage: 4,
					},
				};
			}
		}
		return data;
	});

// Export types
export type ClusterCreateFormData = z.infer<typeof clusterCreateFormSchema>;

// Re-export individual schemas for backward compatibility
export { type Name, NameSchema } from "@/schemas/forms/universal/name-schema";
export {
	type ClusterResource,
	ClusterResourceSchema,
} from "./components/cluster-resource-schema";
export {
	type ClusterTerminationPolicy,
	ClusterTerminationPolicySchema,
} from "./components/cluster-termination-policy-schema";
export {
	type ClusterType,
	ClusterTypeSchema,
} from "./components/cluster-type-schema";
export {
	type ClusterVersion,
	ClusterVersionSchema,
} from "./components/cluster-version-schema";
