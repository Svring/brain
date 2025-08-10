import { z } from "zod";

// Runtime options schema
export const RuntimeNameSchema = z.enum([
  "Debian",
  "C++",
  "Rust",
  "Java",
  "Go",
  "Python",
  "Node.js",
  ".Net",
  "C",
  "PHP",
]);

// Create DevBox schemas
export const DevboxCreateRequestSchema = z.object({
  name: z.string().min(1, "DevBox name is required"),
  runtimeName: RuntimeNameSchema,
  cpu: z.number().min(0).optional().default(2000),
  memory: z.number().min(0).optional().default(4096),
});

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
export type DevboxLifecycleRequest = z.infer<
  typeof DevboxLifecycleRequestSchema
>;
export type DevboxLifecycleResponse = z.infer<
  typeof DevboxLifecycleResponseSchema
>;
export type DevboxDeleteRequest = z.infer<typeof DevboxDeleteRequestSchema>;
export type DevboxDeleteResponse = z.infer<typeof DevboxDeleteResponseSchema>;
export type DevboxErrorResponse = z.infer<typeof DevboxErrorResponseSchema>;
export type RuntimeName = z.infer<typeof RuntimeNameSchema>;
export type DevboxLifecycleAction = z.infer<typeof DevboxLifecycleActionSchema>;
