import { z } from "zod";

export const AiProxyTokenListResponseSchema = z.object({
  code: z.literal(200),
  data: z.object({
    tokens: z.array(
      z.object({
        key: z.string(),
        name: z.string(),
        group: z.string(),
        subnets: z.any().nullable(),
        models: z.any().nullable(),
        status: z.number(),
        id: z.number(),
        used_amount: z.number(),
        request_count: z.number(),
        quota: z.number(),
        period_quota: z.number(),
        period_type: z.string(),
        period_last_update_amount: z.number(),
        created_at: z.number(),
        period_last_update_time: z.number(),
        expired_at: z.number().optional(),
        accessed_at: z.number(),
      })
    ),
    total: z.number(),
  }),
});

export type AiProxyTokenListResponse = z.infer<
  typeof AiProxyTokenListResponseSchema
>;

export const AiProxyFreeUsageResponseSchema = z.object({
  total_limit: z.number(),
  used_today: z.number(),
  remaining_today: z.number(),
  next_reset_time: z.number(),
});

export type AiProxyFreeUsageResponse = z.infer<
  typeof AiProxyFreeUsageResponseSchema
>;
