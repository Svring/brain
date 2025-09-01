import { z } from "zod";

// Reuse universal field schemas (no defaults here)
import { CommandSchema } from "@/schemas/forms/universal/command-schema";
import { ArgsSchema } from "@/schemas/forms/universal/args-schema";
import { ImageSchema } from "@/schemas/forms/universal/image-schema";

// Reuse launchpad field schemas
import { ResourceSchema } from "@/schemas/forms/universal/resource-schema";
import { EnvSchema } from "@/schemas/forms/universal/env-schema";

// Update form schema (no defaults applied)
export const launchpadUpdateFormSchema = z.object({
  image: ImageSchema,
  command: CommandSchema,
  args: ArgsSchema,
  resource: ResourceSchema,
  env: z.array(EnvSchema),
});

export type LaunchpadUpdateFormData = z.infer<typeof launchpadUpdateFormSchema>;
