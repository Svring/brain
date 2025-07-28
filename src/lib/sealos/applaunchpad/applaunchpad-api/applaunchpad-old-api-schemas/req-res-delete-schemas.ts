import { z } from "zod";

export const AppDeleteRequestSchema = z.object({
  name: z.string(),
});

export const AppDeleteResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
});

export type AppDeleteRequest = z.infer<typeof AppDeleteRequestSchema>;
export type AppDeleteResponse = z.infer<typeof AppDeleteResponseSchema>;