import { z } from "zod";

export const DevboxRuntimeSchema = z
  .string()
  .min(1, "Devbox runtime is required");

export type DevboxRuntime = z.infer<typeof DevboxRuntimeSchema>;
