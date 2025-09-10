import { z } from "zod";
import { CommandSchema } from "@/schemas/forms/universal/command-schema";
import { ArgsSchema } from "@/schemas/forms/universal/args-schema";

export const LaunchCommandSchema = z.object({
  command: CommandSchema.optional(),
  args: ArgsSchema.optional(),
});

export type LaunchCommand = z.infer<typeof LaunchCommandSchema>;
