import { z } from "zod";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { devboxUpdateFormSchema } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";

// Runtime options schema - using the constant
export const RuntimeNameSchema = z.enum(DEVBOX_RUNTIMES);

// Create DevBox schemas - using the new form schema
export const DevboxCreateRequestSchema = devboxCreateFormSchema;

// Update DevBox schemas - using the new update form schema
export const DevboxUpdateRequestSchema = devboxUpdateFormSchema;

export const DevboxCreateResponseSchema = z.object({
  data: z.object({
    name: z.string(),
    sshPort: z.number(),
    base64PrivateKey: z.string(),
    userName: z.string(),
    workingDir: z.string(),
    domain: z.string(),
  }),
});

export const DevboxUpdateResponseSchema = z.object({
  data: z.string().default("success update devbox"),
});

// Lifecycle management schemas
export const DevboxLifecycleActionSchema = z.enum([
  "start",
  "stop",
  "restart",
  "shutdown",
]);

export const DevboxLifecycleRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
  action: DevboxLifecycleActionSchema,
});

export const DevboxLifecycleResponseSchema = z.object({
  data: z.string().default("success modify devbox status"),
});

// Shutdown devbox schemas
export const DevboxShutdownRequestSchema = z.object({});

export const DevboxShutdownResponseSchema = z.object({
  data: z.string().default("success shutdown devbox"),
});

// Restart devbox schemas
export const DevboxRestartRequestSchema = z.object({});

export const DevboxRestartResponseSchema = z.object({
  data: z.string().default("success restart devbox"),
});

// Delete DevBox schemas
export const DevboxDeleteRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
});

export const DevboxDeleteResponseSchema = z.object({
  data: z.string().default("success delete devbox"),
});

// Error response schema
export const DevboxErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.string().optional(),
});

// Type exports
export type DevboxCreateRequest = z.infer<typeof DevboxCreateRequestSchema>;
export type DevboxCreateResponse = z.infer<typeof DevboxCreateResponseSchema>;
export type DevboxUpdateRequest = z.infer<typeof DevboxUpdateRequestSchema>;
export type DevboxUpdateResponse = z.infer<typeof DevboxUpdateResponseSchema>;
export type DevboxLifecycleRequest = z.infer<
  typeof DevboxLifecycleRequestSchema
>;
export type DevboxLifecycleResponse = z.infer<
  typeof DevboxLifecycleResponseSchema
>;
export type DevboxShutdownRequest = z.infer<typeof DevboxShutdownRequestSchema>;
export type DevboxShutdownResponse = z.infer<
  typeof DevboxShutdownResponseSchema
>;
export type DevboxRestartRequest = z.infer<typeof DevboxRestartRequestSchema>;
export type DevboxRestartResponse = z.infer<typeof DevboxRestartResponseSchema>;
export type DevboxDeleteRequest = z.infer<typeof DevboxDeleteRequestSchema>;
export type DevboxDeleteResponse = z.infer<typeof DevboxDeleteResponseSchema>;
export type DevboxErrorResponse = z.infer<typeof DevboxErrorResponseSchema>;
export type RuntimeName = z.infer<typeof RuntimeNameSchema>;
export type DevboxLifecycleAction = z.infer<typeof DevboxLifecycleActionSchema>;
