import { z } from "zod";

// Schema for successful app start/pause response
const AppControlSuccessResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();

// Schema for error response (400/500)
const AppControlErrorResponseSchema = z
  .object({
    code: z.number(),
    message: z.string(),
    data: z.string().optional(),
    error: z.string().optional(),
  })
  .strict();

export {
  AppControlSuccessResponseSchema,
  AppControlErrorResponseSchema,
};

export type AppControlSuccessResponse = z.infer<typeof AppControlSuccessResponseSchema>;
export type AppControlErrorResponse = z.infer<typeof AppControlErrorResponseSchema>;