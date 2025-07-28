import { z } from "zod";

// Request schema for checkReady API
export const AppCheckReadyRequestSchema = z.object({
  appName: z.string(),
});

// Individual check result schema
export const CheckReadyDataItemSchema = z.object({
  ready: z.boolean(),
  url: z.string(),
  error: z.string().optional(),
});

// Response schema for checkReady API
export const AppCheckReadyResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
  data: z.array(CheckReadyDataItemSchema),
});

export type AppCheckReadyRequest = z.infer<typeof AppCheckReadyRequestSchema>;
export type AppCheckReadyResponse = z.infer<typeof AppCheckReadyResponseSchema>;
export type CheckReadyDataItem = z.infer<typeof CheckReadyDataItemSchema>;