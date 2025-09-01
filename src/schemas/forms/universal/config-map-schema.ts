import { z } from "zod";

// ConfigMap configuration schema (for create requests)
export const ConfigMapSchema = z.object({
  path: z.string(),
  value: z.string().optional(),
});

export type ConfigMap = z.infer<typeof ConfigMapSchema>;
