import { z } from "zod";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// Schema for patch operation
const PatchOperationSchema = z.object({
  op: z.enum(["add", "remove", "replace", "move", "copy", "test"]),
  path: z.string(),
  value: z.any().optional(),
  from: z.string().optional(), // for move and copy operations
});

// Schema for upsert operation
const UpsertOperationSchema = z.object({
  resource: z.any(),
});

// Schema for delete operation
const DeleteOperationSchema = z.object({
  target: z.any(),
});

// Schema for a single mutation operation
const MutationOperationSchema = z.object({
  resourceKind: z.string().optional(),
  name: z.string().optional(),
  patch: PatchOperationSchema.optional(),
  upsert: UpsertOperationSchema.optional(),
  delete: DeleteOperationSchema.optional(),
});

// Schema for the complete mutation list
const ObjectMutationSchema = z.array(MutationOperationSchema);

export {
  PatchOperationSchema,
  UpsertOperationSchema,
  DeleteOperationSchema,
  MutationOperationSchema,
  ObjectMutationSchema,
};

export type PatchOperation = z.infer<typeof PatchOperationSchema>;
export type UpsertOperation = z.infer<typeof UpsertOperationSchema>;
export type DeleteOperation = z.infer<typeof DeleteOperationSchema>;
export type MutationOperation = z.infer<typeof MutationOperationSchema>;
export type ObjectMutation = z.infer<typeof ObjectMutationSchema>;
