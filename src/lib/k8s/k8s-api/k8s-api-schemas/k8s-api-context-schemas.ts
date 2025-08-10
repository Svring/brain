import { z } from "zod";

export const K8sApiContextSchema = z.object({
  kubeconfig: z.string(),
  namespace: z.string(),
  regionUrl: z.string(),
});

export type K8sApiContext = z.infer<typeof K8sApiContextSchema>;
