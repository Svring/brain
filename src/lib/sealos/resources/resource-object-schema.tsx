import { z } from "zod";
import { DevboxObjectSchema } from "./devbox/devbox-schemas/devbox-object-schema";
import { ClusterObjectSchema } from "./cluster/cluster-schemas/cluster-object-schema";
import { LaunchpadObjectSchema } from "./launchpad/launchpad-object-schema";

// Common pod schema that all resources use
export const CommonPodSchema = z.object({
  name: z.string(),
  status: z.string(),
});

// Unified resource object schema that can handle all resource types
export const ResourceObjectSchema = z.union([
  // Devbox resources
  DevboxObjectSchema,
  // Cluster resources
  ClusterObjectSchema,
  // Launchpad resources (Deployment and StatefulSet)
  LaunchpadObjectSchema,
  // Generic fallback for any other resource type
  z.object({
    kind: z.string(),
    name: z.string(),
    status: z.string().optional(),
    pods: z.array(CommonPodSchema).optional(),
  }),
]);

export type ResourceObject = z.infer<typeof ResourceObjectSchema>;

// Helper function to safely parse resource data
export function parseResourceObject(data: any): ResourceObject | null {
  try {
    return ResourceObjectSchema.parse(data);
  } catch (error) {
    console.warn("Failed to parse resource object:", error);
    return null;
  }
}

// Helper function to extract pods from any resource object
export function extractPodsFromResource(resource: ResourceObject | null): Array<{ name: string; status: string }> {
  if (!resource || !resource.pods) return [];
  
  return resource.pods
    .map((pod: any) => ({
      name: pod.name || "unknown",
      status: pod.status || "Unknown",
    }))
    .filter((pod) => pod.name !== "unknown");
}
