import { z } from "zod";

export const ClusterResourceSchema = z.object({
	cpu: z.number().nullable().optional(),
	memory: z.number().nullable().optional(),
	storage: z.number().nullable().optional(),
	replicas: z.number().nullable().optional(),
});

export const ClusterComponentSchema = z.object({
	name: z.string().nullable().optional(),
	status: z.string().nullable().optional(),
	resource: ClusterResourceSchema.nullable().optional(),
});

export const ClusterConnectionSchema = z.object({
	privateConnection: z
		.object({
			endpoint: z.string().nullable().optional(),
			host: z.string().nullable().optional(),
			port: z.string().nullable().optional(),
			username: z.string().nullable().optional(),
			password: z.string().nullable().optional(),
			connectionString: z.string().nullable().optional(),
		})
		.nullable()
		.optional(),
	publicConnection: z.string().nullable().optional(),
});

export const ClusterBackupSchema = z
	.object({
		cronExpression: z.string().optional(),
		enabled: z.boolean().optional(),
		method: z.string().optional(),
		pitrEnabled: z.boolean().optional(),
		repoName: z.string().optional(),
		retentionPeriod: z.string().optional(),
	})
	.optional();

export const PodSchema = z.object({
	name: z.string().nullable().optional(),
	status: z.string().nullable().optional(),
	upTime: z.string().optional().nullable(),
	containers: z.any().nullable().optional(),
});

export const ClusterObjectSchema = z.object({
	name: z.string(),
	kind: z.string(),
	type: z
		.enum([
			"postgresql",
			"mongodb",
			"redis",
			"apecloud-mysql",
			"kafka",
			"milvus",
			"weaviate",
			"clickhouse",
		])
		.nullable()
		.optional(),
	version: z.string().nullable().optional(),
	operationalStatus: z.any().optional().nullable(),
	status: z.string().nullable().optional(),
	resource: z
		.union([ClusterResourceSchema, z.array(z.any())])
		.nullable()
		.optional(),
	components: z
		.union([z.array(ClusterComponentSchema), z.object({}).passthrough()])
		.optional()
		.nullable(),
	connection: ClusterConnectionSchema.nullable().optional(),
	backup: ClusterBackupSchema.optional().nullable(),
	pods: z.array(PodSchema).optional().nullable(),
});

export type ClusterResource = z.infer<typeof ClusterResourceSchema>;
export type ClusterComponent = z.infer<typeof ClusterComponentSchema>;
export type ClusterConnection = z.infer<typeof ClusterConnectionSchema>;
export type ClusterBackup = z.infer<typeof ClusterBackupSchema>;
export type ClusterObject = z.infer<typeof ClusterObjectSchema>;
export type Pod = z.infer<typeof PodSchema>;
