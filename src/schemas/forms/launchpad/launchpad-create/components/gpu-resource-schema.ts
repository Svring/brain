import { z } from "zod";

// GPU resource configuration schema
export const GpuResourceSchema = z.object({
  vendor: z.string().default("nvidia"),
  type: z.string(),
  amount: z.number().default(1),
});

export type GpuResource = z.infer<typeof GpuResourceSchema>;
