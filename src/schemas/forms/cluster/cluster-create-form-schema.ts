import { z } from "zod";
import { NameSchema } from "@/schemas/forms/universal/name-schema";
import { ClusterTypeSchema } from "./components/cluster-type-schema";
import { ClusterVersionSchema } from "./components/cluster-version-schema";
import { ClusterResourceSchema } from "./components/cluster-resource-schema";
import { ClusterTerminationPolicySchema } from "./components/cluster-termination-policy-schema";
import { nanoid } from "@/lib/utils";

// Main cluster create form schema
export const clusterCreateFormSchema = z.object({
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
});

// Export types
export type ClusterCreateFormData = z.infer<typeof clusterCreateFormSchema>;

// Re-export individual schemas for backward compatibility
export { NameSchema, type Name } from "@/schemas/forms/universal/name-schema";
export {
  ClusterTypeSchema,
  type ClusterType,
} from "./components/cluster-type-schema";
export {
  ClusterVersionSchema,
  type ClusterVersion,
} from "./components/cluster-version-schema";
export {
  ClusterResourceSchema,
  type ClusterResource,
} from "./components/cluster-resource-schema";
export {
  ClusterTerminationPolicySchema,
  type ClusterTerminationPolicy,
} from "./components/cluster-termination-policy-schema";
