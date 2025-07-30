"use client";

import { z } from "zod";
import { IngressObjectSchema } from "@/lib/sealos/ingress/ingress-object-schema";
import { DevboxObjectSchema } from "@/lib/sealos/devbox/devbox-schemas/devbox-object-schema";
import { ClusterObjectSchema } from "@/lib/sealos/cluster/cluster-schemas/cluster-object-schema";
import { DeploymentObjectSchema } from "@/lib/sealos/deployment/deployment-object-schema";
import { StatefulsetObjectSchema } from "@/lib/sealos/statefulset/statefulset-object-schema";
import { ObjectStorageBucketObjectSchema } from "@/lib/sealos/objectstorage/objectstorage-schemas/objectstorage-object-schema";

/**
 * Map of resource types to their corresponding Zod schemas
 * This allows for easy extension when adding new resource types
 */
export const RESOURCE_SCHEMA_MAP: Record<string, z.ZodObject<any>> = {
  devbox: DevboxObjectSchema,
  cluster: ClusterObjectSchema,
  deployment: DeploymentObjectSchema,
  statefulset: StatefulsetObjectSchema,
  objectstoragebucket: ObjectStorageBucketObjectSchema,
  ingress: IngressObjectSchema,
  // Add more resource schemas here as they become available
  // example: "pod": PodObjectSchema,
  // example: "service": ServiceObjectSchema,
};

/**
 * Gets the schema for a given resource type
 * @param resourceType - The resource type to get schema for
 * @returns The corresponding Zod schema or null if not found
 */
export function getSchemaForResourceType(
  resourceType: string
): z.ZodObject<any> | null {
  return RESOURCE_SCHEMA_MAP[resourceType] || null;
}

/**
 * Gets all supported resource types
 * @returns Array of supported resource type strings
 */
export function getSupportedResourceTypes(): string[] {
  return Object.keys(RESOURCE_SCHEMA_MAP);
}
