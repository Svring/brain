import { z } from "zod";
import { createNumberUnionSchema } from "@/lib/sealos/sealos-utils";

// CPU options as numbers for launchpad resources
const LAUNCHPAD_CPU_OPTIONS = [0.1, 0.2, 0.5, 1, 2, 4, 8, 16] as const;

// Memory options as numbers for launchpad resources
const LAUNCHPAD_MEMORY_OPTIONS = [0.1, 0.5, 1, 2, 4, 8, 16, 32] as const;

export const LaunchpadResourceSchema = z.object({
  replicas: z.number().min(1).max(10).default(1),
  cpu: createNumberUnionSchema(LAUNCHPAD_CPU_OPTIONS),
  memory: createNumberUnionSchema(LAUNCHPAD_MEMORY_OPTIONS),
});

export type LaunchpadResource = z.infer<typeof LaunchpadResourceSchema>;
