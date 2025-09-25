import { z } from "zod";

// Schema for environment variables
export const DevboxEnvSchema = z
  .object({
    name: z
      .string()
      .min(1, "Environment variable name is required")
      .max(255, "Environment variable name must be 255 characters or less"),
    value: z
      .string()
      .max(4096, "Environment variable value must be 4096 characters or less")
      .optional(),
    valueFrom: z
      .object({
        secretKeyRef: z.object({
          name: z.string().min(1, "Secret name is required"),
          key: z.string().min(1, "Secret key is required"),
        }),
      })
      .optional(),
  })
  .refine((data) => data.value || data.valueFrom, {
    message: "Either 'value' or 'valueFrom' must be provided",
  });

export type DevboxEnv = z.infer<typeof DevboxEnvSchema>;
