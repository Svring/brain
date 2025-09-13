import { z } from "zod";

// Enable Public Access Request Schema
export const EnablePublicAccessRequestSchema = z.object({
  databaseName: z.string().min(1, "Database name is required"),
});

// Enable Public Access Response Schema
export const EnablePublicAccessResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    databaseName: z.string(),
    message: z.string(),
  }),
});

// Disable Public Access Request Schema
export const DisablePublicAccessRequestSchema = z.object({
  databaseName: z.string().min(1, "Database name is required"),
});

// Disable Public Access Response Schema
export const DisablePublicAccessResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    databaseName: z.string(),
    message: z.string(),
  }),
});

// Type exports
export type EnablePublicAccessRequest = z.infer<
  typeof EnablePublicAccessRequestSchema
>;
export type EnablePublicAccessResponse = z.infer<
  typeof EnablePublicAccessResponseSchema
>;
export type DisablePublicAccessRequest = z.infer<
  typeof DisablePublicAccessRequestSchema
>;
export type DisablePublicAccessResponse = z.infer<
  typeof DisablePublicAccessResponseSchema
>;
