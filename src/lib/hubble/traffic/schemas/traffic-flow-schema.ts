import { z } from "zod";

// Flow data schema for individual CR
export const FlowDataSchema = z.object({
  crName: z.string(),
  flows: z.array(z.string()),
});

// Get Pod Traffic request schema
export const GetTrafficRequestSchema = z.object({
  resources: z.array(z.string()).min(1, "Resource name is required"),
});

// Get Pod Traffic response schema
export const GetTrafficResponseSchema = z.object({
  message: z.string(),
  data: z.array(FlowDataSchema),
});

// Type exports
export type FlowData = z.infer<typeof FlowDataSchema>;
export type GetTrafficRequest = z.infer<typeof GetTrafficRequestSchema>;
export type GetTrafficResponse = z.infer<typeof GetTrafficResponseSchema>;
