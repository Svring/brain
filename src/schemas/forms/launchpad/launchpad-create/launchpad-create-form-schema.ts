import { z } from "zod";
import { GpuResourceSchema } from "./components/gpu-resource-schema";
import { ResourceSchema } from "./components/resource-schema";
import { PortSchema } from "./components/port-schema";
import { EnvSchema } from "./components/env-schema";
import { HpaSchema } from "./components/hpa-schema";
import { ImageRegistrySchema } from "./components/image-registry-schema";
import { StorageSchema, storageSizeOptions } from "./components/storage-schema";
import { ConfigMapSchema } from "./components/config-map-schema";

// Main launchpad create form schema
export const launchpadCreateFormSchema = z.object({
  name: z.string().min(1, "Name is required").default("hello-world"),
  image: z.string().min(1, "Image is required").default("nginx"),
  command: z.string().default(""),
  args: z.string().default(""),
  resource: ResourceSchema.default({
    replicas: 1,
    cpu: 0.1,
    memory: 0.5,
  }),
  ports: z.array(PortSchema).default([
    {
      port: 80,
      protocol: "TCP",
      appProtocol: "HTTP",
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
export {
  GpuResourceSchema,
  type GpuResource,
} from "./components/gpu-resource-schema";
export { ResourceSchema, type Resource } from "./components/resource-schema";
export { PortSchema, type Port } from "./components/port-schema";
export { EnvSchema, type Env } from "./components/env-schema";
export { HpaSchema, type Hpa } from "./components/hpa-schema";
export {
  ImageRegistrySchema,
  type ImageRegistry,
} from "./components/image-registry-schema";
export {
  StorageSchema,
  storageSizeOptions,
  type Storage,
} from "./components/storage-schema";
export {
  ConfigMapSchema,
  type ConfigMap,
} from "./components/config-map-schema";
