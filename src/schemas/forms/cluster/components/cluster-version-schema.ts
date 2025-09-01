import { z } from "zod";

export const ClusterVersionSchema = z.object({
  version: z.string().min(1, "Cluster version is required"),
});

export type ClusterVersion = z.infer<typeof ClusterVersionSchema>;
