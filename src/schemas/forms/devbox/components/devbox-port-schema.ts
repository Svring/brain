import { z } from "zod";

// Schema for creating new ports
export const DevboxPortCreateSchema = z.object({
  number: z.number().min(1).max(65535),
  protocol: z.enum(["HTTP", "GRPC", "WS"]).default("HTTP"),
  exposesPublicDomain: z.boolean().default(true),
  customDomain: z.string().optional(),
});

// Schema for updating existing ports (portName is required, other fields are optional)
export const DevboxPortUpdateSchema = z.object({
  portName: z.string().min(1, "Port name is required for updates"),
  number: z.number().min(1).max(65535).optional(),
  protocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean().optional(),
  customDomain: z.string().optional(),
});

// Schema for simple port operations (create, update, delete)
export const DevboxPortSimpleUpdateSchema = z
  .object({
    operation: z.enum(["create", "update", "delete"]),
    number: z.number().min(1).max(65535),
    protocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
    exposesPublicDomain: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // For create operations, protocol and exposesPublicDomain are required
      if (data.operation === "create") {
        return (
          data.protocol !== undefined && data.exposesPublicDomain !== undefined
        );
      }
      return true;
    },
    {
      message:
        "Protocol and exposesPublicDomain are required for create operations",
      path: ["protocol", "exposesPublicDomain"],
    }
  );

// Schema for batch port operations
export const DevboxPortBatchUpdateSchema = z.object({
  payload: z
    .array(DevboxPortSimpleUpdateSchema)
    .min(1, "At least one port operation is required"),
});

// Union schema that accepts both create and update formats
export const DevboxPortSchema = z.union([
  DevboxPortCreateSchema,
  DevboxPortUpdateSchema,
]);

export type DevboxPort = z.infer<typeof DevboxPortSchema>;
export type DevboxPortCreate = z.infer<typeof DevboxPortCreateSchema>;
export type DevboxPortUpdate = z.infer<typeof DevboxPortUpdateSchema>;
export type DevboxPortSimpleUpdate = z.infer<
  typeof DevboxPortSimpleUpdateSchema
>;
export type DevboxPortBatchUpdate = z.infer<typeof DevboxPortBatchUpdateSchema>;
