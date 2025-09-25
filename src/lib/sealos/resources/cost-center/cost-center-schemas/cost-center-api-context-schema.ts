import { z } from "zod";

export const CostCenterApiContextSchema = z.object({
  baseUrl: z.string().optional(),
  authorization: z.string().optional(),
  workspace: z.string().optional(),
  regionDomain: z.string().optional(),
  internalToken: z.string().optional(),
  namespace: z.string().optional(),
  kubeconfig: z.string().optional(),
});

export type CostCenterApiContext = z.infer<typeof CostCenterApiContextSchema>;
