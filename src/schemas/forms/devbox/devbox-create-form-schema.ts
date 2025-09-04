import { z } from "zod";
import { NameSchema } from "@/schemas/forms/universal/name-schema";
import { DevboxRuntimeSchema } from "./components/devbox-runtime-schema";
import { DevboxResourceSchema } from "./components/devbox-resource-schema";
import { DevboxPortSchema } from "./components/devbox-port-schema";

// Main devbox create form schema
export const devboxCreateFormSchema = z.object({
  name: NameSchema.default("my-devbox"),
  runtime: DevboxRuntimeSchema.default({
    runtime: "ubuntu-22.04",
  }),
  resource: DevboxResourceSchema.default({
    cpu: 2,
    memory: 2,
  }),
  ports: z.array(DevboxPortSchema).default([
    {
      port: 80,
      protocol: "HTTP",
      openPublicDomain: true,
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
