import { z } from "zod";

export const AiProxyCreateTokenRequestSchema = z.object({
  name: z.string(),
});

export const AiProxyCreateTokenResponseSchema = z.object({
  code: z.literal(200),
  data: z.object({
    key: z.string(),
    name: z.string(),
    group: z.string(),
    subnets: z.any().nullable(),
    models: z.any().nullable(),
    status: z.number(),
    id: z.number(),
    quota: z.number(),
    used_amount: z.number(),
    request_count: z.number(),
    created_at: z.number(),
    expired_at: z.number(),
    accessed_at: z.number(),
  }),
  message: z.string(),
});

export type AiProxyCreateTokenRequest = z.infer<
  typeof AiProxyCreateTokenRequestSchema
>;
export type AiProxyCreateTokenResponse = z.infer<
  typeof AiProxyCreateTokenResponseSchema
>;
