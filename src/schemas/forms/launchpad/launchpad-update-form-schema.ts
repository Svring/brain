import { z } from "zod";

// Reuse universal field schemas (no defaults here)
import { CommandSchema } from "@/schemas/forms/universal/command-schema";
import { ArgsSchema } from "@/schemas/forms/universal/args-schema";
import { ImageSchema } from "@/schemas/forms/universal/image-schema";

// Reuse launchpad field schemas
import { ResourceUpdateSchema } from "@/schemas/forms/universal/resource-schema";
import { PortSchema } from "@/schemas/forms/universal/port-schema";
import { EnvSchema } from "@/schemas/forms/universal/env-schema";
import { ConfigMapArraySchema } from "@/schemas/forms/universal/configmap-schema";
import { StorageArraySchema } from "@/schemas/forms/universal/storage-schema";

// Update form schema (all fields optional for partial updates)
export const launchpadUpdateFormSchema = z.object({
  image: ImageSchema.optional(),
  command: CommandSchema.optional(),
  args: ArgsSchema.optional(),
  resource: ResourceUpdateSchema.optional(),
  ports: z.array(PortSchema).optional(),
  env: z.array(EnvSchema).optional(),
  configMap: ConfigMapArraySchema.optional(),
  storage: StorageArraySchema.optional(),
});

export type LaunchpadUpdateFormData = z.infer<typeof launchpadUpdateFormSchema>;
