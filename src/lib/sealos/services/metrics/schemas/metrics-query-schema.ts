import { z } from "zod";
import { getCurrentUnixTime, getMonitorTimespan } from "@/lib/date/date-utils";

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
  .transform((data) => {
    // Auto-set start, end, and step only if time is not provided (range query)
    if (!data.time && (!data.start || !data.end || !data.step)) {
      const currentTime = getCurrentUnixTime();
      const timespan = getMonitorTimespan(currentTime); // 1 hour earlier

      return {
        ...data,
        start: data.start || timespan.start.toString(),
        end: data.end || timespan.end.toString(),
        step: data.step || "120s", // 120 seconds
      };
    }

    return data;
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
      z
        .object({
          metric: z.record(z.string(), z.string()),
          value: z.tuple([z.number(), z.string()]).nullable().optional(), // For instant queries
          values: z
            .array(z.tuple([z.number(), z.string()]))
            .nullable()
            .optional(), // For range queries, can be null
        })
        .passthrough() // Allow additional fields that might be present in the response
    ),
  }),
  stats: z.object({
    seriesFetched: z.string().optional(),
    executionTimeMsec: z.number().optional(), // The actual field name from response
    execTime: z.number().optional(), // Keep for backward compatibility
  }),
});

// Type exports
export type GetLaunchPadMetricsRequest = z.infer<
  typeof GetLaunchPadMetricsRequestSchema
>;
export type GetLaunchPadMetricsResponse = z.infer<
  typeof GetLaunchPadMetricsResponseSchema
>;
