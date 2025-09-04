import { z } from "zod";

export const DevboxPortSchema = z.object({
  port: z.number().min(1).max(65535),
  protocol: z.enum(["HTTP", "GRPC", "WS"]),
  openPublicDomain: z.boolean(),
  customDomain: z.string().optional(),
});

export type DevboxPort = z.infer<typeof DevboxPortSchema>;
