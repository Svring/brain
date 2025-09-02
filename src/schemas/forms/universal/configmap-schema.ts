import { z } from "zod";

export const ConfigMapSchema = z.object({
  path: z.string().min(1, "Mount path is required"),
  value: z.string().optional(),
});

export type ConfigMap = z.infer<typeof ConfigMapSchema>;
