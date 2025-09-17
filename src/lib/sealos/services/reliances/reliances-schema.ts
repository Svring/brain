import { z } from "zod";
import type { Image } from "@/schemas/forms/launchpad/components/launchpad-image-schema";
import type { Env } from "@/schemas/forms/universal/env-schema";

/**
 * Base resource object schema that can represent any resource type
 */
export const ResourceObjectSchema = z
  .object({
    name: z.string(),
    kind: z.string(),
    image: z.union([z.any(), z.string()]).optional(), // Can be ImageSchema object or string
    env: z.array(z.any()).optional(), // Array of Env objects
  })
  .passthrough(); // Allow additional properties

/**
 * Resource reliance/dependency schema
 */
export const ResourceRelianceSchema = z.object({
  name: z.string(),
  kind: z.string(),
});

/**
 * Resource reliances grouped by kind and resource name
 */
export const ResourceReliancesSchema = z.record(
  z.string(), // kind
  z.record(
    z.string(), // resource name
    z.array(ResourceRelianceSchema) // array of dependencies
  )
);

// Type exports
export type ResourceObject = z.infer<typeof ResourceObjectSchema>;
export type ResourceReliance = z.infer<typeof ResourceRelianceSchema>;
export type ResourceReliances = z.infer<typeof ResourceReliancesSchema>;
