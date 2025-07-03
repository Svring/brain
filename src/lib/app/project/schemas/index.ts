import { z } from "zod";
import { ResourceTargetSchema } from "@/lib/k8s/schemas";

// Request schemas for project queries (namespace is in K8sApiContext)
export const GetProjectRequestSchema = z.object({
  projectName: z.string(),
});

export const ListProjectsRequestSchema = z.object({
  labelSelector: z.string().optional(),
});

// Response schemas
export const ProjectResourcesSchema = z.record(
  z.string(), // project name
  z.array(ResourceTargetSchema) // array of resources for that project
);

// Inferred types
export type GetProjectRequest = z.infer<typeof GetProjectRequestSchema>;
export type ProjectResources = z.infer<typeof ProjectResourcesSchema>;
export type ListProjectsRequest = z.infer<typeof ListProjectsRequestSchema>;
