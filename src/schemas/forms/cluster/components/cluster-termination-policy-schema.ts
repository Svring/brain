import { z } from "zod";

export const ClusterTerminationPolicySchema = z.enum(["Delete", "WipeOut"], {
  required_error: "Termination policy is required",
});

export type ClusterTerminationPolicy = z.infer<
  typeof ClusterTerminationPolicySchema
>;
