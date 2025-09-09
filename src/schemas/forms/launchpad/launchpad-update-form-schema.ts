import { z } from "zod";

// Reuse universal field schemas (no defaults here)
import { CommandSchema } from "@/schemas/forms/universal/command-schema";
import { ArgsSchema } from "@/schemas/forms/universal/args-schema";
import { ImageSchema } from "@/schemas/forms/universal/image-schema";
import { EnvSchema } from "@/schemas/forms/universal/env-schema";
import { HpaSchema } from "@/schemas/forms/universal/hpa-schema";
import { ImageRegistrySchema } from "@/schemas/forms/universal/image-registry-schema";
import { StorageSchema } from "@/schemas/forms/universal/storage-schema";
import { ConfigMapSchema } from "@/schemas/forms/universal/config-map-schema";

// Import launchpad-specific schemas
import { LaunchpadResourceSchema } from "./components/launchpad-resource-schema";
import {
  LaunchpadPortSchema,
  LaunchpadPortSimpleUpdateSchema,
} from "./components/launchpad-port-schema";

// Update form schema (all fields optional for partial updates)
export const launchpadUpdateFormSchema = z.object({
  // Keep all existing fields from create schema
  name: z.string().optional(),
  image: ImageSchema.optional(),
  command: CommandSchema.optional(),
  args: ArgsSchema.optional(),
  resource: LaunchpadResourceSchema.optional(),
  ports: z
    .array(LaunchpadPortSchema)
    .optional()
    .refine(
      (ports) => {
        // Ensure all ports have unique port numbers
        if (!ports || ports.length === 0) {
          return true; // No ports to validate
        }

        const portNumbers = ports
          .map((port) => port.number)
          .filter((num) => num !== undefined);

        const uniqueNumbers = new Set(portNumbers);

        return uniqueNumbers.size === portNumbers.length;
      },
      {
        message: "All ports must have unique port numbers",
      }
    ),
  env: z.array(EnvSchema).optional(),
  hpa: HpaSchema.nullable().optional(),
  imageRegistry: ImageRegistrySchema.nullable().optional(),
  storage: z.array(StorageSchema).optional(),
  configMap: z.array(ConfigMapSchema).optional(),
  // Alternative simple ports for when using simple operations
  simplePorts: z
    .array(LaunchpadPortSimpleUpdateSchema)
    .optional()
    .refine(
      (ports) => {
        // Ensure all ports have unique port numbers
        if (!ports || ports.length === 0) {
          return true; // No ports to validate
        }

        const portNumbers = ports
          .map((port) => port.number)
          .filter((num) => num !== undefined);

        const uniqueNumbers = new Set(portNumbers);

        return uniqueNumbers.size === portNumbers.length;
      },
      {
        message: "All port operations must have unique port numbers",
      }
    ),
});

export type LaunchpadUpdateFormData = z.infer<typeof launchpadUpdateFormSchema>;
