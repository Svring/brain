import { z } from "zod";
import type { InstanceList, InstanceResource } from "@/lib/k8s/schemas";

// Request schemas for project queries (namespace is in K8sApiContext)
export const GetProjectRequestSchema = z.object({
  projectName: z.string(),
});

export const ListProjectsRequestSchema = z.object({
  labelSelector: z.string().optional(),
});

// Inferred types
export type GetProjectRequest = z.infer<typeof GetProjectRequestSchema>;
export type ListProjectsRequest = z.infer<typeof ListProjectsRequestSchema>;

// Project types are now based on Instance resources
export type ProjectList = InstanceList;
export type Project = InstanceResource;
