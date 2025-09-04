import { z } from "zod";

export const ClusterVersionSchema = z
  .string()
  .min(1, "Cluster version is required");

export type ClusterVersion = z.infer<typeof ClusterVersionSchema>;
