import { z } from "zod";

export const ClusterTerminationPolicySchema = z
  .string()
  .min(1, "Termination policy is required");

export type ClusterTerminationPolicy = z.infer<
  typeof ClusterTerminationPolicySchema
>;
