import { z } from "zod";
import type { InstanceList, InstanceResource } from "@/lib/k8s/schemas";

// Request schemas for project queries (namespace is in K8sApiContext)
export const GetProjectRequestSchema = z.object({
  projectName: z.string(),
});

export type GetProjectRequest = z.infer<typeof GetProjectRequestSchema>;

export type ProjectList = InstanceList;
export type Project = InstanceResource;
