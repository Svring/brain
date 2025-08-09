import { z } from "zod";
import { InputParametersSchema } from "../../../deployment/schemas/deploy-manifest-schemas";

// Request schema: identical to InputParametersSchema
export const LaunchpadCreateRequestSchema = InputParametersSchema;

// Response schema: matches the provided response structure
export const LaunchpadCreateResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
  data: z.array(z.string()),
});

export type LaunchpadCreateRequest = z.infer<
  typeof LaunchpadCreateRequestSchema
>;
export type LaunchpadCreateResponse = z.infer<
  typeof LaunchpadCreateResponseSchema
>;
