import { z } from "zod";
import { InputParametersSchema } from "../../../deployment/schemas/deploy-manifest-schemas";

// Request schema: identical to InputParametersSchema
export const AppCreateRequestSchema = InputParametersSchema;

// Response schema: matches the provided response structure
export const AppCreateResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
  data: z.array(z.string()),
});

export type AppCreateRequest = z.infer<typeof AppCreateRequestSchema>;
export type AppCreateResponse = z.infer<typeof AppCreateResponseSchema>;