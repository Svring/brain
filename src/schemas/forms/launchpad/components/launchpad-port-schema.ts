import { z } from "zod";

// Schema for creating new ports
export const LaunchpadPortCreateSchema = z.object({
	portName: z.string().optional(),
	number: z.number().min(1).max(65535),
	protocol: z.enum(["HTTP", "GRPC", "WS", "TCP", "UDP"]).default("HTTP"),
	exposesPublicDomain: z.boolean().default(true),
	customDomain: z.string().optional(),
});

// Schema for updating existing ports (portName is required, other fields are optional)
export const LaunchpadPortUpdateSchema = z.object({
	portName: z.string().min(1, "Port name is required for updates"),
	number: z.number().min(1).max(65535).optional(),
	protocol: z.enum(["HTTP", "GRPC", "WS", "TCP", "UDP"]).optional(),
	exposesPublicDomain: z.boolean().optional(),
	customDomain: z.string().optional(),
});

// Schema for simple port operations (create, update, delete)
export const LaunchpadPortSimpleUpdateSchema = z
	.object({
		operation: z.enum(["create", "update", "delete"]),
		number: z.number().min(1).max(65535),
		protocol: z.enum(["HTTP", "GRPC", "WS", "TCP"]).optional(),
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
		},
	);

// Schema for batch port operations
export const LaunchpadPortBatchUpdateSchema = z.object({
	payload: z
		.array(LaunchpadPortSimpleUpdateSchema)
		.min(1, "At least one port operation is required"),
});

// Union schema that accepts both create and update formats
export const LaunchpadPortSchema = z.union([
	LaunchpadPortCreateSchema,
	LaunchpadPortUpdateSchema,
]);

export type LaunchpadPort = z.infer<typeof LaunchpadPortSchema>;
export type LaunchpadPortCreate = z.infer<typeof LaunchpadPortCreateSchema>;
export type LaunchpadPortUpdate = z.infer<typeof LaunchpadPortUpdateSchema>;
export type LaunchpadPortSimpleUpdate = z.infer<
	typeof LaunchpadPortSimpleUpdateSchema
>;
export type LaunchpadPortBatchUpdate = z.infer<
	typeof LaunchpadPortBatchUpdateSchema
>;
