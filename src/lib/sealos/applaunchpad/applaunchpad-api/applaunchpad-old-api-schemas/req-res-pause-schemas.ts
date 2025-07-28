import { z } from "zod";

export const AppPauseRequestSchema = z.object({
  appName: z.string(),
});

export const AppPauseResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type AppPauseRequest = z.infer<typeof AppPauseRequestSchema>;
export type AppPauseResponse = z.infer<typeof AppPauseResponseSchema>;