import { z } from "zod";

export const MetricsApiContextSchema = z.object({
  baseURL: z.string(),
  kubeconfig: z.string(),
  namespace: z.string(),
});

export type MetricsApiContext = z.infer<typeof MetricsApiContextSchema>;
