import { z } from "zod";
import { DevboxRuntimeSchema } from "./components/devbox-runtime-schema";
import { DevboxResourceSchema } from "./components/devbox-resource-schema";
import { DevboxPortCreateSchema } from "./components/devbox-port-schema";

// Main devbox create form schema
export const devboxCreateFormSchema = z.object({
  name: z
    .string()
    .min(1, "Devbox name is required")
    .max(63, "Devbox name must be 63 characters or less")
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Devbox name must be DNS compliant: lowercase, numbers, hyphens only"
    )
    .default("my-devbox"),
  runtime: DevboxRuntimeSchema.default("python"),
  resource: DevboxResourceSchema.default({
    cpu: 2,
    memory: 2,
  }),
  ports: z.array(DevboxPortCreateSchema).default([
    {
      number: 80,
      protocol: "HTTP",
      exposesPublicDomain: true,
    },
  ]),
});

// Export types
export type DevboxCreateFormData = z.infer<typeof devboxCreateFormSchema>;
