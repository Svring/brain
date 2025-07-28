import { z } from "zod";
import { InputParametersSchema } from "../deploy-manifest-schemas";

// Request schema: identical to InputParametersSchema
export const DeployCreateRequestSchema = InputParametersSchema;

// Response schema: matches the provided response structure
export const DeployCreateResponseSchema = z.object({
  code: z.literal(200),
  message: z.string(),
  data: z.array(z.string()),
});

export type DeployCreateRequest = z.infer<typeof DeployCreateRequestSchema>;
export type DeployCreateResponse = z.infer<typeof DeployCreateResponseSchema>;
