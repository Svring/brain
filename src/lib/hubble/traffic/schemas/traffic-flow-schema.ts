import { z } from "zod";

// Flow object schema
export const FlowSchema = z.object({
  from: z.string(),
  to: z.string(),
  timestamp: z.string(), // ISO 8601 timestamp
});

// Get Pod Traffic request schema
export const GetPodTrafficRequestSchema = z.object({
  namespace: z.string().min(1, "Namespace is required"),
  pod: z.string().min(1, "Pod name is required"),
});

// Get Pod Traffic response schema
export const GetPodTrafficResponseSchema = z.object({
  flows: z.array(FlowSchema),
});

// Type exports
export type Flow = z.infer<typeof FlowSchema>;
export type GetPodTrafficRequest = z.infer<typeof GetPodTrafficRequestSchema>;
export type GetPodTrafficResponse = z.infer<typeof GetPodTrafficResponseSchema>;