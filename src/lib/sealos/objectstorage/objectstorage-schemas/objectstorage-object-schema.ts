import { z } from "zod";

// Object Storage Access Configuration Schema
export const ObjectStorageAccessSchema = z.object({
  accessKey: z.string(),
  bucket: z.string(),
  external: z.string(),
  internal: z.string(),
  secretKey: z.string(),
});

// Object Storage Policy Enum
export const ObjectStoragePolicySchema = z.enum([
  "Private",
  "PublicRead",
  "PublicReadwrite",
]);

// Main Object Storage Object Schema
export const ObjectStorageObjectSchema = z.object({
  name: z.string(),
  policy: ObjectStoragePolicySchema,
  access: ObjectStorageAccessSchema,
});

// Type exports
export type ObjectStorageAccess = z.infer<typeof ObjectStorageAccessSchema>;
export type ObjectStoragePolicy = z.infer<typeof ObjectStoragePolicySchema>;
export type ObjectStorageObject = z.infer<typeof ObjectStorageObjectSchema>;