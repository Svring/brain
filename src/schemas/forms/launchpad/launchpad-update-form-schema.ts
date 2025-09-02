import { z } from "zod";

// Reuse universal field schemas (no defaults here)
import { CommandSchema } from "@/schemas/forms/universal/command-schema";
import { ArgsSchema } from "@/schemas/forms/universal/args-schema";
import { ImageSchema } from "@/schemas/forms/universal/image-schema";

// Reuse launchpad field schemas
import { ResourceUpdateSchema } from "@/schemas/forms/universal/resource-schema";
import { EnvSchema } from "@/schemas/forms/universal/env-schema";
import { ConfigMapSchema } from "@/schemas/forms/universal/configmap-schema";
import { StorageSchema } from "@/schemas/forms/universal/storage-schema";

// Update form schema (all fields optional for partial updates)
export const launchpadUpdateFormSchema = z.object({
  image: ImageSchema.optional(),
  command: CommandSchema.optional(),
  args: ArgsSchema.optional(),
  resource: ResourceUpdateSchema.optional(),
  env: z.array(EnvSchema).optional(),
  configMap: z.array(ConfigMapSchema).optional(),
  storage: z.array(StorageSchema).optional(),
});

export type LaunchpadUpdateFormData = z.infer<typeof launchpadUpdateFormSchema>;
