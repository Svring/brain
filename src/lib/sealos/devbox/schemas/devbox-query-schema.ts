import { z } from "zod";

// Get DevBox by name schemas
export const DevboxGetRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
});

export const DevboxNetworkSchema = z.object({
  portName: z.string(),
  port: z.number(),
  protocol: z.string(),
  networkName: z.string(),
  openPublicDomain: z.boolean(),
  publicDomain: z.string().optional(),
  customDomain: z.string().optional(),
});

export const DevboxInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  createTime: z.string(),
  imageName: z.string(),
  sshPort: z.number(),
  cpu: z.number(),
  memory: z.number(),
  networks: z.array(DevboxNetworkSchema),
  base64PrivateKey: z.string(),
  userName: z.string(),
  workingDir: z.string(),
  domain: z.string(),
});

export const DevboxGetResponseSchema = z.object({
  data: DevboxInfoSchema,
});

// Get DevBox list schemas
export const DevboxListItemSchema = z.object({
  name: z.string(),
  id: z.string(),
  createTime: z.string(),
});

export const DevboxListResponseSchema = z.object({
  data: z.array(DevboxListItemSchema),
});

// Error response schema for query operations
export const DevboxQueryErrorResponseSchema = z.object({
  code: z.number(),
  error: z.string(),
});

// Type exports
export type DevboxGetRequest = z.infer<typeof DevboxGetRequestSchema>;
export type DevboxGetResponse = z.infer<typeof DevboxGetResponseSchema>;
export type DevboxInfo = z.infer<typeof DevboxInfoSchema>;
export type DevboxNetwork = z.infer<typeof DevboxNetworkSchema>;
export type DevboxListItem = z.infer<typeof DevboxListItemSchema>;
export type DevboxListResponse = z.infer<typeof DevboxListResponseSchema>;
export type DevboxQueryErrorResponse = z.infer<
  typeof DevboxQueryErrorResponseSchema
>;
