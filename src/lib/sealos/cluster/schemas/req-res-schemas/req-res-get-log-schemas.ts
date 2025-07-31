import { z } from "zod";

// Log entry schema
export const LogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.string(),
  content: z.string(),
});

// Log data schema
export const LogDataSchema = z.object({
  logs: z.array(LogEntrySchema),
});

// Get log request schema
export const GetLogRequestSchema = z.object({
  page: z.number().min(1, "Page must be at least 1"),
  pageSize: z.number().min(1, "Page size must be at least 1"),
  podName: z.string().min(1, "Pod name is required"),
  dbType: z.string().min(1, "Database type is required"),
  logType: z.string().min(1, "Log type is required"),
  logPath: z.string().min(1, "Log path is required"),
});

// Get log response schema
export const GetLogResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: LogDataSchema,
});

// Type exports
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type LogData = z.infer<typeof LogDataSchema>;
export type GetLogRequest = z.infer<typeof GetLogRequestSchema>;
export type GetLogResponse = z.infer<typeof GetLogResponseSchema>;