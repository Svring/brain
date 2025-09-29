import { z } from "zod";

// Base schemas
export const TerminationPolicySchema = z.enum(["Delete", "WipeOut"]);
export const ClusterTypeSchema = z.enum([
  "postgresql",
  "mongodb",
  "apecloud-mysql",
  "redis",
  "kafka",
  "qdrant",
  "nebula",
  "weaviate",
  "milvus",
  "pulsar",
  "clickhouse",
]);

export const ClusterStatusSchema = z.enum([
  "Creating",
  "Starting",
  "Stopping",
  "Stopped",
  "Running",
  "Updating",
  "SpecUpdating",
  "Rebooting",
  "Upgrade",
  "VerticalScaling",
  "VolumeExpanding",
  "Failed",
  "UnKnow",
  "Deleting",
]);

export const SourceTypeSchema = z.enum(["app_store", "sealaf"]);
export const BackupTypeSchema = z.enum(["day", "hour", "week"]);

// Log-related schemas
export const LogClusterTypeSchema = z.enum([
  "apecloud-mysql",
  "mongodb",
  "redis",
  "postgresql",
]);

export const LogTypeSchema = z.enum(["runtimeLog", "slowQuery", "errorLog"]);

// Resource schemas
export const ResourceSchema = z.object({
  cpu: z.string().default("1000m"),
  memory: z.string().default("1024Mi"),
  storage: z.string().default("3Gi"),
  replicas: z.number().min(1).max(3).default(1),
});

// Auto backup schema
export const AutoBackupSchema = z.object({
  start: z.boolean(),
  type: BackupTypeSchema,
  week: z.array(z.string()),
  hour: z.string(),
  minute: z.string(),
  saveTime: z.number(),
  saveType: z.string(),
});

// Source schema
export const SourceSchema = z.object({
  hasSource: z.boolean(),
  sourceName: z.string(),
  sourceType: SourceTypeSchema,
});

// Cluster form schema
export const ClusterFormSchema = z.object({
  terminationPolicy: TerminationPolicySchema.default("Delete"),
  name: z.string(),
  type: ClusterTypeSchema,
  version: z.string(),
  resource: ResourceSchema,
  autoBackup: AutoBackupSchema.optional(),
});

// Create cluster request schema - new structure matches the API
export const CreateClusterRequestSchema = z.object({
  terminationPolicy: TerminationPolicySchema.default("Delete"),
  name: z.string(),
  type: ClusterTypeSchema,
  version: z.string(),
  resource: ResourceSchema,
  autoBackup: AutoBackupSchema.optional(),
});

// Update cluster request schema (only resource can be updated)
export const UpdateClusterRequestSchema = z.object({
  resource: ResourceSchema,
});

// Cluster response data schema
export const ClusterResponseDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ClusterTypeSchema,
  version: z.string(),
  terminationPolicy: TerminationPolicySchema,
  resource: ResourceSchema,
  autoBackup: AutoBackupSchema.optional(),
  status: ClusterStatusSchema,
  createTime: z.string(),
  totalResource: z.object({
    cpu: z.string(),
    memory: z.string(),
    storage: z.string(),
  }),
  isDiskSpaceOverflow: z.boolean(),
  source: SourceSchema,
});

// Create cluster response schema
export const CreateClusterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: ClusterResponseDataSchema,
});

// Get cluster response schema
export const GetClusterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: ClusterResponseDataSchema,
});

// Update cluster response schema
export const UpdateClusterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

// Delete cluster response schema
export const DeleteClusterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

// Start cluster response schema
export const StartClusterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

// Pause cluster response schema
export const PauseClusterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

// Restart cluster response schema
export const RestartClusterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

// Log entry schema
export const LogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.string(),
  content: z.string(),
});

// Log metadata schema
export const LogMetadataSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  processingTime: z.string(),
  hasMore: z.boolean(),
});

// Get logs data response schema
export const GetLogsDataResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    logs: z.array(LogEntrySchema),
    metadata: LogMetadataSchema,
  }),
});

// Log file info schema
export const LogFileInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  dir: z.string(),
  kind: z.string(),
  attr: z.string(),
  hardLinks: z.number(),
  owner: z.string(),
  group: z.string(),
  size: z.number(),
  updateTime: z.string(),
  linkTo: z.string().optional(),
  processed: z.boolean().optional(),
});

// Get logs files response schema
export const GetLogsFilesResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.array(LogFileInfoSchema),
});

// Cluster versions response schema
export const ClusterVersionsResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.record(z.array(z.string())),
});

// Cluster API context schema
export const ClusterApiContextSchema = z.object({
  baseUrl: z.string().optional(),
  authorization: z.string().optional(),
});

// Type exports
export type TerminationPolicy = z.infer<typeof TerminationPolicySchema>;
export type ClusterType = z.infer<typeof ClusterTypeSchema>;
export type ClusterStatus = z.infer<typeof ClusterStatusSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type BackupType = z.infer<typeof BackupTypeSchema>;
export type LogClusterType = z.infer<typeof LogClusterTypeSchema>;
export type LogType = z.infer<typeof LogTypeSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type AutoBackup = z.infer<typeof AutoBackupSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type ClusterForm = z.infer<typeof ClusterFormSchema>;
export type CreateClusterRequest = z.infer<typeof CreateClusterRequestSchema>;
export type UpdateClusterRequest = z.infer<typeof UpdateClusterRequestSchema>;
export type ClusterResponseData = z.infer<typeof ClusterResponseDataSchema>;
export type CreateClusterResponse = z.infer<typeof CreateClusterResponseSchema>;
export type GetClusterResponse = z.infer<typeof GetClusterResponseSchema>;
export type UpdateClusterResponse = z.infer<typeof UpdateClusterResponseSchema>;
export type DeleteClusterResponse = z.infer<typeof DeleteClusterResponseSchema>;
export type StartClusterResponse = z.infer<typeof StartClusterResponseSchema>;
export type PauseClusterResponse = z.infer<typeof PauseClusterResponseSchema>;
export type RestartClusterResponse = z.infer<
  typeof RestartClusterResponseSchema
>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type LogMetadata = z.infer<typeof LogMetadataSchema>;
export type GetLogsDataResponse = z.infer<typeof GetLogsDataResponseSchema>;
export type LogFileInfo = z.infer<typeof LogFileInfoSchema>;
export type GetLogsFilesResponse = z.infer<typeof GetLogsFilesResponseSchema>;
export type ClusterVersionsResponse = z.infer<
  typeof ClusterVersionsResponseSchema
>;
export type ClusterApiContext = z.infer<typeof ClusterApiContextSchema>;
