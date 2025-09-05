import { z } from "zod";

// CPU options as numbers for devbox resources
const DEVBOX_CPU_OPTIONS = [0.1, 0.2, 0.5, 1, 2, 4, 8, 16] as const;

// Memory options as numbers for devbox resources
const DEVBOX_MEMORY_OPTIONS = [0.1, 0.5, 1, 2, 4, 8, 16, 32] as const;

// Helper function to create a Zod union schema from an array of numbers
const createNumberUnionSchema = <T extends readonly number[]>(options: T) =>
  z.union(options.map((value) => z.literal(value)) as any);

export const DevboxResourceSchema = z.object({
  cpu: createNumberUnionSchema(DEVBOX_CPU_OPTIONS),
  memory: createNumberUnionSchema(DEVBOX_MEMORY_OPTIONS),
});

export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
