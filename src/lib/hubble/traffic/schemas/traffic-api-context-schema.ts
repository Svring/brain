import { z } from "zod";

export const TrafficApiContextSchema = z.object({
  baseURL: z.string(),
  kubeconfig: z.string(),
});

export type TrafficApiContext = z.infer<typeof TrafficApiContextSchema>;
