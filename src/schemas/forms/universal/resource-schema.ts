import { z } from "zod";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { GpuResourceSchema } from "./gpu-resource-schema";
import { createNumberUnionSchema } from "@/lib/sealos/sealos-utils";

// Resource configuration schema
export const ResourceSchema = z.object({
  replicas: createNumberUnionSchema(REPLICAS_OPTIONS),
  cpu: createNumberUnionSchema(CPU_OPTIONS),
  memory: createNumberUnionSchema(MEMORY_OPTIONS),
  gpu: GpuResourceSchema.optional(),
});

// Resource update schema (all fields optional for partial updates)
export const ResourceUpdateSchema = z.object({
  replicas: createNumberUnionSchema(REPLICAS_OPTIONS).optional(),
  cpu: createNumberUnionSchema(CPU_OPTIONS).optional(),
  memory: createNumberUnionSchema(MEMORY_OPTIONS).optional(),
  gpu: GpuResourceSchema.optional(),
});

export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceUpdate = z.infer<typeof ResourceUpdateSchema>;
