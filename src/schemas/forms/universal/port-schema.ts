import { z } from "zod";

// Port configuration schema (for create requests)
export const PortSchema = z.object({
  port: z.number(),
  protocol: z.enum(["TCP", "UDP", "SCTP"]),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean(),
});

export type Port = z.infer<typeof PortSchema>;
