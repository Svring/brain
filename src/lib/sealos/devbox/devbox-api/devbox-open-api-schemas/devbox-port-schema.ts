import { z } from "zod";

// Port protocol schema
export const PortProtocolSchema = z.enum(["HTTP", "GRPC", "WS"]);

// Create DevBox port schemas
export const DevboxPortCreateRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
  port: z.number().min(1).max(65_535, "Port must be between 1 and 65535"),
  protocol: PortProtocolSchema.optional().default("HTTP"),
});

export const DevboxPortDataSchema = z.object({
  portName: z.string(),
  port: z.number(),
  protocol: PortProtocolSchema,
  networkName: z.string(),
  openPublicDomain: z.boolean(),
  publicDomain: z.string().optional(),
  customDomain: z.string().optional(),
});

export const DevboxPortCreateResponseSchema = z.object({
  data: DevboxPortDataSchema,
});

// Remove DevBox port schemas
export const DevboxPortRemoveRequestSchema = z.object({
  devboxName: z.string().min(1, "DevBox name is required"),
  port: z.number().min(1).max(65_535, "Port must be between 1 and 65535"),
});

export const DevboxPortRemoveResponseSchema = z.object({
  data: z.array(DevboxPortDataSchema),
});

// Port management error response schema
export const DevboxPortErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  error: z.unknown().optional(),
});

// Type exports
export type PortProtocol = z.infer<typeof PortProtocolSchema>;
export type DevboxPortCreateRequest = z.infer<
  typeof DevboxPortCreateRequestSchema
>;
export type DevboxPortCreateResponse = z.infer<
  typeof DevboxPortCreateResponseSchema
>;
export type DevboxPortData = z.infer<typeof DevboxPortDataSchema>;
export type DevboxPortRemoveRequest = z.infer<
  typeof DevboxPortRemoveRequestSchema
>;
export type DevboxPortRemoveResponse = z.infer<
  typeof DevboxPortRemoveResponseSchema
>;
export type DevboxPortErrorResponse = z.infer<
  typeof DevboxPortErrorResponseSchema
>;
