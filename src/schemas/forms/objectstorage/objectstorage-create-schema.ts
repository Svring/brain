import { z } from "zod";
import { NameSchema } from "@/schemas/forms/universal/name-schema";
import { PolicySchema } from "@/schemas/forms/universal/policy-schema";

// Main object storage create form schema
export const objectStorageCreateSchema = z.object({
  name: NameSchema.default("my-objectstorage"),
  policy: PolicySchema.default("private"),
});

// Export types
export type ObjectStorageCreateFormData = z.infer<
  typeof objectStorageCreateSchema
>;

// Re-export individual schemas for backward compatibility
export { NameSchema, type Name } from "@/schemas/forms/universal/name-schema";
export {
  PolicySchema,
  type Policy,
} from "@/schemas/forms/universal/policy-schema";
