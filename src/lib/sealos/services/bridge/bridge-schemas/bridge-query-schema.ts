import { z } from "zod";

/**
 * Interface for the description JSON that can be found in schema descriptions
 */
export const ObjectQuerySchema = z.object({
  resourceType: z.string(),
  path: z.array(z.string()).optional(),
  label: z.string().optional(),
  name: z.string().optional(), // regex pattern for name matching
  note: z.string().optional(),
});

export type ObjectQuery = z.infer<typeof ObjectQuerySchema>;

/**
 * Schema that supports both single ObjectQuery and arrays of ObjectQuery
 */
export const ObjectQueryOrArraySchema = z.union([
  ObjectQuerySchema,
  z.array(ObjectQuerySchema),
]);

export type ObjectQueryOrArray = z.infer<typeof ObjectQueryOrArraySchema>;
