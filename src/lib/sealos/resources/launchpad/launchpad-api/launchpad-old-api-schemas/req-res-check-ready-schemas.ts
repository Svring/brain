import { z } from "zod";

// Request schema for checkReady API
export const LaunchpadCheckReadyRequestSchema = z.object({
  name: z.string(),
});

// Individual check result schema
export const CheckReadyDataItemSchema = z.object({
  ready: z.boolean(),
  url: z.string(),
  error: z.string().optional(),
});

// Response schema for checkReady API
export const LaunchpadCheckReadyResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
  data: z.array(CheckReadyDataItemSchema),
});

export type LaunchpadCheckReadyRequest = z.infer<
  typeof LaunchpadCheckReadyRequestSchema
>;
export type LaunchpadCheckReadyResponse = z.infer<
  typeof LaunchpadCheckReadyResponseSchema
>;
export type CheckReadyDataItem = z.infer<typeof CheckReadyDataItemSchema>;
