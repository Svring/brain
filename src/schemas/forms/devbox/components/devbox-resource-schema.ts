import { z } from "zod";
import { createNumberUnionSchema } from "@/lib/sealos/sealos-utils";

// CPU options as numbers for devbox resources
const DEVBOX_CPU_OPTIONS = [0.1, 0.2, 0.5, 1, 2, 4, 8, 16] as const;

// Memory options as numbers for devbox resources
const DEVBOX_MEMORY_OPTIONS = [0.1, 0.5, 1, 2, 4, 8, 16, 32] as const;

export const DevboxResourceSchema = z.object({
  cpu: createNumberUnionSchema(DEVBOX_CPU_OPTIONS),
  memory: createNumberUnionSchema(DEVBOX_MEMORY_OPTIONS),
});

export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
