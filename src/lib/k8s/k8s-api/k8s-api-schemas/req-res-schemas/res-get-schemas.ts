import { z } from "zod";
import { K8sResourceSchema } from "../resource-schemas/kubernetes-resource-schemas";

// Custom resource get response schema
export const CustomResourceGetResponseSchema = K8sResourceSchema;

// Builtin resource get response schema
export const BuiltinResourceGetResponseSchema = K8sResourceSchema;

// Type exports
export type CustomResourceGetResponse = z.infer<
  typeof CustomResourceGetResponseSchema
>;
export type BuiltinResourceGetResponse = z.infer<
  typeof BuiltinResourceGetResponseSchema
>;
