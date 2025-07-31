import { z } from "zod";

// Flow data schema for individual CR
export const FlowDataSchema = z.object({
  crName: z.string(),
  flows: z.array(z.string()),
});

// Get Pod Traffic request schema
export const GetPodTrafficRequestSchema = z.object({
  crNames: z.array(z.string()).min(1, "CR name is required"),
});

// Get Pod Traffic response schema
export const GetPodTrafficResponseSchema = z.object({
  message: z.string(),
  data: z.array(FlowDataSchema),
});

// Type exports
export type FlowData = z.infer<typeof FlowDataSchema>;
export type GetPodTrafficRequest = z.infer<typeof GetPodTrafficRequestSchema>;
export type GetPodTrafficResponse = z.infer<typeof GetPodTrafficResponseSchema>;
