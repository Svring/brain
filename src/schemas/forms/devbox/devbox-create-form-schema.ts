import { z } from "zod";
import { DevboxRuntimeSchema } from "./components/devbox-runtime-schema";
import { DevboxResourceSchema } from "./components/devbox-resource-schema";
import { DevboxPortSchema } from "./components/devbox-port-schema";

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
  ports: z.array(DevboxPortSchema).default([
    {
      number: 80,
      protocol: "HTTP",
      exposesPublicDomain: true,
    },
  ]),
});

// Export types
export type DevboxCreateFormData = z.infer<typeof devboxCreateFormSchema>;

// Re-export individual schemas for backward compatibility
export { NameSchema, type Name } from "@/schemas/forms/universal/name-schema";
export {
  DevboxRuntimeSchema,
  type DevboxRuntime,
} from "./components/devbox-runtime-schema";
export {
  DevboxResourceSchema,
  type DevboxResource,
} from "./components/devbox-resource-schema";
export {
  DevboxPortSchema,
  type DevboxPort,
} from "./components/devbox-port-schema";
