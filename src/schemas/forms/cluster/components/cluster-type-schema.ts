import { z } from "zod";

export const ClusterTypeSchema = z.string().min(1, "Cluster type is required");

export type ClusterType = z.infer<typeof ClusterTypeSchema>;
