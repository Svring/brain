import { z } from "zod";
import { NameSchema } from "@/schemas/forms/universal/name-schema";
import { ImageSchema } from "@/schemas/forms/universal/image-schema";
import { CommandSchema } from "@/schemas/forms/universal/command-schema";
import { ArgsSchema } from "@/schemas/forms/universal/args-schema";
import { ResourceSchema } from "../universal/resource-schema";
import { LaunchpadPortCreateSchema } from "../universal/port-schema";
import { EnvSchema } from "../universal/env-schema";
import { HpaSchema } from "../universal/hpa-schema";
import { ImageRegistrySchema } from "../universal/image-registry-schema";
import { StorageSchema } from "../universal/storage-schema";
import { ConfigMapSchema } from "../universal/config-map-schema";

// Main launchpad create form schema
export const launchpadCreateFormSchema = z.object({
  name: NameSchema.default("hello-world"),
  image: ImageSchema.default("nginx"),
  command: CommandSchema.default(""),
  args: ArgsSchema.default(""),
  resource: ResourceSchema.default({
    replicas: 1,
    cpu: 0.5,
    memory: 0.5,
  }),
  ports: z.array(LaunchpadPortCreateSchema).default([
    {
      number: 80,
      protocol: "HTTP",
      exposesPublicDomain: true,
    },
  ]),
  env: z.array(EnvSchema).default([]),
  hpa: HpaSchema.nullable().default(null),
  imageRegistry: ImageRegistrySchema.nullable().default(null),
  storage: z.array(StorageSchema).default([]),
  configMap: z.array(ConfigMapSchema).default([]),
});

// Export types
export type LaunchpadCreateFormData = z.infer<typeof launchpadCreateFormSchema>;

// Re-export individual schemas for backward compatibility
export { NameSchema, type Name } from "@/schemas/forms/universal/name-schema";
export {
  ImageSchema,
  type Image,
} from "@/schemas/forms/universal/image-schema";
export {
  CommandSchema,
  type Command,
} from "@/schemas/forms/universal/command-schema";
export { ArgsSchema, type Args } from "@/schemas/forms/universal/args-schema";
export {
  GpuResourceSchema,
  type GpuResource,
} from "../universal/gpu-resource-schema";
export { ResourceSchema, type Resource } from "../universal/resource-schema";
export {
  LaunchpadPortCreateSchema,
  type LaunchpadPortCreate,
} from "../universal/port-schema";
export { EnvSchema, type Env } from "../universal/env-schema";
export { HpaSchema, type Hpa } from "../universal/hpa-schema";
export {
  ImageRegistrySchema,
  type ImageRegistry,
} from "../universal/image-registry-schema";
export {
  StorageSchema,
  storageSizeOptions,
  type Storage,
} from "../universal/storage-schema";
export {
  ConfigMapSchema,
  type ConfigMap,
} from "../universal/config-map-schema";
