import { z } from "zod";

// Environment variable schema
export const EnvSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
  valueFrom: z
    .object({
      secretKeyRef: z.object({
        key: z.string(),
        name: z.string(),
      }),
    })
    .optional(),
});

export type Env = z.infer<typeof EnvSchema>;
