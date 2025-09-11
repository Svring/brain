import { z } from "zod";
import { NameSchema } from "@/schemas/forms/universal/name-schema";
import { LaunchCommandSchema } from "./components/launch-command-schema";
import { ImageSchema } from "./components/launchpad-image-schema";
import { LaunchpadResourceSchema } from "./components/launchpad-resource-schema";
import {
  LaunchpadPortCreateSchema,
  LaunchpadPortSchema,
} from "./components/launchpad-port-schema";
import { EnvSchema } from "../universal/env-schema";
import { StorageSchema } from "../universal/storage-schema";
import { ConfigMapSchema } from "../universal/config-map-schema";

// Main launchpad create form schema
export const launchpadCreateFormSchema = z.object({
  name: NameSchema.default("hello-world"),
  image: ImageSchema.default({
    imageName: "nginx",
    imageRegistry: null,
  }),
  launchCommand: LaunchCommandSchema.default({
    command: "",
    args: "",
  }),
  resource: LaunchpadResourceSchema.default({
    replicas: 1,
    cpu: 0.5,
    memory: 0.5,
    hpa: null,
  }),
  ports: z.array(LaunchpadPortCreateSchema).default([
    {
      number: 80,
      protocol: "HTTP",
      exposesPublicDomain: true,
    },
  ]),
  env: z.array(EnvSchema).default([]),
  storage: z.array(StorageSchema).default([]),
  configMap: z.array(ConfigMapSchema).default([]),
});

// Export types
export type LaunchpadCreateFormData = z.infer<typeof launchpadCreateFormSchema>;

// Re-export individual schemas for backward compatibility
export { NameSchema, type Name } from "@/schemas/forms/universal/name-schema";
export {
  LaunchCommandSchema,
  type LaunchCommand,
} from "./components/launch-command-schema";
export {
  LaunchpadResourceSchema,
  type LaunchpadResource,
} from "./components/launchpad-resource-schema";
export {
  LaunchpadPortSchema,
  type LaunchpadPort,
} from "./components/launchpad-port-schema";
export { EnvSchema, type Env } from "../universal/env-schema";
export {
  StorageSchema,
  storageSizeOptions,
  type Storage,
} from "../universal/storage-schema";
export {
  ConfigMapSchema,
  type ConfigMap,
} from "../universal/config-map-schema";
