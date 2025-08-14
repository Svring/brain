import { z } from "zod";

// LaunchPad metrics query request schema
export const GetLaunchPadMetricsRequestSchema = z
  .object({
    namespace: z.string().min(1, "Namespace is required"),
    type: z.enum(["cpu", "memory", "average_cpu", "average_memory"], {
      errorMap: () => ({
        message:
          "Type must be one of: cpu, memory, average_cpu, average_memory",
      }),
    }),
    launchPadName: z.string().min(1, "LaunchPad name is required"),
    // For range queries
    start: z.string().optional(),
    end: z.string().optional(),
    step: z.string().optional(),
    // For instant queries
    time: z.string().optional(),
  })
  .refine(
    (data) => {
      // Either provide start/end/step for range query OR time for instant query
      const isRangeQuery = data.start && data.end && data.step;
      const isInstantQuery = data.time;

      if (isRangeQuery && isInstantQuery) {
        return false; // Cannot have both
      }

      if (!isRangeQuery && !isInstantQuery) {
        return false; // Must have one or the other
      }

      return true;
    },
    {
      message:
        "Must provide either (start, end, step) for range query or (time) for instant query",
      path: ["start"], // This will show the error on the start field
    }
  );

// LaunchPad metrics query response schema
export const GetLaunchPadMetricsResponseSchema = z.object({
  status: z.string(),
  isPartial: z.boolean(),
  data: z.object({
    resultType: z.string(),
    result: z.array(
      z.object({
        metric: z.record(z.string(), z.string()),
        value: z.tuple([z.number(), z.string()]).optional(), // For instant queries
        values: z.array(z.tuple([z.number(), z.string()])).optional(), // For range queries
      })
    ),
  }),
  stats: z.object({
    execTime: z.number(),
  }),
});

// Type exports
export type GetLaunchPadMetricsRequest = z.infer<typeof GetLaunchPadMetricsRequestSchema>;
export type GetLaunchPadMetricsResponse = z.infer<typeof GetLaunchPadMetricsResponseSchema>;
