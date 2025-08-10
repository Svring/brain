import { z } from "zod";

export const AiProxyDeleteTokenRequestSchema = z.object({
  id: z.number(),
});

export const AiProxyDeleteTokenResponseSchema = z.object({
  code: z.literal(200),
  message: z.literal("Token deleted successfully"),
});

export type AiProxyDeleteTokenRequest = z.infer<
  typeof AiProxyDeleteTokenRequestSchema
>;
export type AiProxyDeleteTokenResponse = z.infer<
  typeof AiProxyDeleteTokenResponseSchema
>;
