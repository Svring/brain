import { z } from "zod";

export const ManualAuthInputSchema = z.object({
  kubeconfig: z.string(),
  regionToken: z.string(),
  appToken: z.string(),
  devboxToken: z.string(),
});

export const CompletedAuthContextSchema = z.object({
  id: z.string(),
  kubeconfig: z.string(),
  namespace: z.string(),
  regionUrl: z.string(),
  regionToken: z.string(),
  appToken: z.string(),
  devboxToken: z.string(),
  apiKey: z.string(),
  baseUrl: z.string(),
});
