import { z } from "zod";
import { PolicySchema } from "@/schemas/forms/universal/policy-schema";

// Update form schema (only policy field for partial updates)
export const objectStorageUpdateSchema = z.object({
  policy: PolicySchema,
});

export type ObjectStorageUpdateFormData = z.infer<
  typeof objectStorageUpdateSchema
>;
