import { z } from "zod";
import { ResourceSchema } from "../../universal/resource-schema";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";

// Extended CPU options for devbox resources (includes 16 cores)
const DEVBOX_CPU_OPTIONS = [...CPU_OPTIONS, 16] as const;

// Extended memory options for devbox resources (includes 32 GB)
const DEVBOX_MEMORY_OPTIONS = [...MEMORY_OPTIONS, 32] as const;

// Helper function to create a Zod union schema from an array of numbers
const createNumberUnionSchema = <T extends readonly number[]>(options: T) =>
  z.union(options.map((value) => z.literal(value)) as any);

export const DevboxResourceSchema = ResourceSchema.omit({
  replicas: true,
}).extend({
  cpu: createNumberUnionSchema(DEVBOX_CPU_OPTIONS),
  memory: createNumberUnionSchema(DEVBOX_MEMORY_OPTIONS),
});

export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
