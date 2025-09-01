import { z } from "zod";

// Port configuration schema (for create requests)
export const PortSchema = z.object({
  port: z.number().default(80),
  protocol: z.enum(["TCP", "UDP", "SCTP"]).default("TCP"),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean().default(false),
});

export type Port = z.infer<typeof PortSchema>;
