import { z } from "zod";

// Log file item schema
export const LogFileItemSchema = z.object({
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
});

// Get log files request schema
export const GetLogFilesRequestSchema = z.object({
  podName: z.string().min(1, "Pod name is required"),
  dbType: z.string().min(1, "Database type is required"),
  logType: z.string().min(1, "Log type is required"),
});

// Get log files response schema
export const GetLogFilesResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.array(LogFileItemSchema),
});

// Type exports
export type LogFileItem = z.infer<typeof LogFileItemSchema>;
export type GetLogFilesRequest = z.infer<typeof GetLogFilesRequestSchema>;
export type GetLogFilesResponse = z.infer<typeof GetLogFilesResponseSchema>;