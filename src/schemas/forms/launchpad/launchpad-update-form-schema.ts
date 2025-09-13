import { z } from "zod";
import { LaunchCommandSchema } from "./components/launch-command-schema";
import { ImageSchema } from "./components/launchpad-image-schema";
import { LaunchpadResourceUpdateSchema } from "./components/launchpad-resource-schema";
import {
  LaunchpadPortSchema,
  LaunchpadPortSimpleUpdateSchema,
} from "./components/launchpad-port-schema";
import { EnvSchema } from "@/schemas/forms/universal/env-schema";
import { StorageSchema } from "@/schemas/forms/universal/storage-schema";
import { ConfigMapSchema } from "@/schemas/forms/universal/config-map-schema";

// Update form schema (all fields optional for partial updates)
export const launchpadUpdateFormSchema = z.object({
  // Keep all existing fields from create schema
  name: z.string().optional(),
  image: ImageSchema.optional(),
  launchCommand: LaunchCommandSchema.optional(),
  resource: LaunchpadResourceUpdateSchema.optional(),
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
  storage: z.array(StorageSchema).optional(),
  configMap: z.array(ConfigMapSchema).optional(),
});

export type LaunchpadUpdateFormData = z.infer<typeof launchpadUpdateFormSchema>;
