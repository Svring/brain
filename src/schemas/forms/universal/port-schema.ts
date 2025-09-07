import { z } from "zod";

// Schema for creating new ports (portName is optional)
export const LaunchpadPortCreateSchema = z.object({
  portName: z.string().optional(),
  number: z.number().min(1).max(65535),
  protocol: z.enum(["HTTP", "GRPC", "WS"]).default("HTTP"),
  exposesPublicDomain: z.boolean().default(true),
  customDomain: z.string().optional(),
});

// Schema for updating existing ports (portName is required, other fields are optional)
export const LaunchpadPortUpdateSchema = z.object({
  portName: z.string().min(1, "Port name is required for updates"),
  number: z.number().min(1).max(65535).optional(),
  protocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean().optional(),
  customDomain: z.string().optional(),
});

// Union schema that accepts both create and update formats
export const PortSchema = z.union([
  LaunchpadPortCreateSchema,
  LaunchpadPortUpdateSchema,
]);

export type LaunchpadPort = z.infer<typeof PortSchema>;
export type LaunchpadPortCreate = z.infer<typeof LaunchpadPortCreateSchema>;
export type LaunchpadPortUpdate = z.infer<typeof LaunchpadPortUpdateSchema>;

// Legacy type alias for backward compatibility
export type Port = LaunchpadPort;
