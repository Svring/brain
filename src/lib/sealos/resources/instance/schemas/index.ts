import { z } from "zod";
import type { InstanceList, InstanceResource } from "@/lib/k8s/schemas";

// Request schemas for instance queries (namespace is in K8sApiContext)
export const GetInstanceRequestSchema = z.object({
  instanceName: z.string(),
});

export type GetInstanceRequest = z.infer<typeof GetInstanceRequestSchema>;

export type InstanceList = InstanceList;
export type Instance = InstanceResource;
