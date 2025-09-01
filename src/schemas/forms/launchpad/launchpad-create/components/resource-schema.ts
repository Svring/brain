import { z } from "zod";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { GpuResourceSchema } from "./gpu-resource-schema";

// Helper function to create a Zod union schema from an array of numbers
const createNumberUnionSchema = <T extends readonly number[]>(options: T) =>
  z.union(options.map((value) => z.literal(value)) as any);

// Resource configuration schema
export const ResourceSchema = z.object({
  replicas: createNumberUnionSchema(REPLICAS_OPTIONS).default(1),
  cpu: createNumberUnionSchema(CPU_OPTIONS).default(0.1),
  memory: createNumberUnionSchema(MEMORY_OPTIONS).default(0.5),
  gpu: GpuResourceSchema.optional(),
});

export type Resource = z.infer<typeof ResourceSchema>;
