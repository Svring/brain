import { z } from "zod";
import { NameSchema } from "@/schemas/forms/universal/name-schema";
import { ClusterTypeSchema } from "./components/cluster-type-schema";
import { ClusterVersionSchema } from "./components/cluster-version-schema";
import { ClusterResourceSchema } from "./components/cluster-resource-schema";

// Main cluster create form schema
export const clusterCreateFormSchema = z.object({
  name: NameSchema.default("my-cluster"),
  type: ClusterTypeSchema.default({
    type: "kubernetes",
  }),
  version: ClusterVersionSchema.default({
    version: "1.28",
  }),
  resource: ClusterResourceSchema.default({
    replicas: 1,
    cpu: 2,
    memory: 4,
    storage: 20,
  }),
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
