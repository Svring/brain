import { z } from "zod";

// Horizontal Pod Autoscaler schema
export const HpaSchema = z.object({
  target: z.enum(["cpu", "memory", "gpu"]),
  value: z.number(),
  minReplicas: z.number(),
  maxReplicas: z.number(),
});

export type Hpa = z.infer<typeof HpaSchema>;
