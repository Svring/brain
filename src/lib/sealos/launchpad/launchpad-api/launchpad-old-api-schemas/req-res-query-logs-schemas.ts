import { z } from "zod";

// JsonQuery schema for advanced query parameters
export const JsonQuerySchema = z.object({
  key: z.string(),
  mode: z.string(), // "=", "!=", ">", "<", etc.
  value: z.string(),
});

// Request schema for queryLogs API
export const QueryLogsRequestSchema = z.object({
  time: z.string().optional().default("24h"), // 查询的时间范围，例如：1h, 1m, 1d
  namespace: z.string().optional(), // 查询的命名空间名称
  app: z.string(), // 查询的app
  limit: z.string().optional().default("50"), // 返回的日志条数限制，默认值为 100
  jsonMode: z.string().optional().default("true"), // 是否开启Json模式 true则开启，false则不开启
  stderrMode: z.string().optional().default("false"), // 是否只查看stderr，true则开启只查看，false则不开启只查看
  numberMode: z.string().optional(), // 是否查询日志条目，true则查看，false则不查看
  numberLevel: z.string().optional(), // 查询日志条目的层级，值为m，h，d等
  pod: z.array(z.string()).optional().default([]), // 需要查询的Pod，传空则查询全部Pod
  container: z.array(z.string()).optional().default([]), // 需要查询的Container，传空则查询全部Container
  keyword: z.string().optional().default(""), // 查询时过滤的关键词
  jsonQuery: z.array(JsonQuerySchema).optional().default([]), // 使用json模式时的查询参数
});

// Response schema for queryLogs API
export const QueryLogsResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.string(), // 日志数据以字符串形式返回
});

export type JsonQuery = z.infer<typeof JsonQuerySchema>;
export type QueryLogsRequest = z.infer<typeof QueryLogsRequestSchema>;
export type QueryLogsResponse = z.infer<typeof QueryLogsResponseSchema>;
