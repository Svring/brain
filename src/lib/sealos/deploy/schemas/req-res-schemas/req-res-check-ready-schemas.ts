import { z } from "zod";

// Request schema for checkReady API
export const DeployCheckReadyRequestSchema = z.object({
  appName: z.string(),
});

// Individual check result schema
export const CheckReadyDataItemSchema = z.object({
  ready: z.boolean(),
  url: z.string(),
  error: z.string().optional(),
});

// Response schema for checkReady API
export const DeployCheckReadyResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
  data: z.array(CheckReadyDataItemSchema),
});

export type DeployCheckReadyRequest = z.infer<typeof DeployCheckReadyRequestSchema>;
export type DeployCheckReadyResponse = z.infer<typeof DeployCheckReadyResponseSchema>;
export type CheckReadyDataItem = z.infer<typeof CheckReadyDataItemSchema>;