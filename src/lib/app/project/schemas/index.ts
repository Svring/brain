import { z } from "zod";
import { ResourceTargetSchema } from "@/lib/k8s/schemas";

// Request schemas for project queries
export const ListProjectsRequestSchema = z.object({
  namespace: z.string(),
});

export const GetProjectRequestSchema = z.object({
  namespace: z.string(),
  projectName: z.string(),
});

// Response schemas
export const ProjectResourcesSchema = z.record(
  z.string(), // project name
  z.array(ResourceTargetSchema) // array of resources for that project
);

// Inferred types
export type ListProjectsRequest = z.infer<typeof ListProjectsRequestSchema>;
export type GetProjectRequest = z.infer<typeof GetProjectRequestSchema>;
export type ProjectResources = z.infer<typeof ProjectResourcesSchema>;
