import { z } from "zod";
import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";

const PortSchema = z.object({
  number: z.number(),
  name: z.string().optional(),
  nodePort: z.number().optional(),
  protocol: z.string(),
  serviceName: z.string().optional(),
  privateAddress: z.string().optional(),
  publicAddress: z.string().optional(),
  networkName: z.string().optional(),
  host: z.string().optional(),
});

const ResourceSchema = z.object({
  replicas: z.number(),
  cpu: z.number(),
  memory: z.number(),
  storage: z.number(),
});

const PodSchema = z.object({
  name: z.string(),
  status: z.string(),
  containers: z.any(),
});

const ConfigMapSchema = z.object({
  name: z.string(),
  path: z.string(),
});

const LocalStorageSchema = z.object({
  name: z.string(),
  path: z.string(),
});

const ThresholdSchema = z.object({
  resource: z.string(),
  usage: z.number(),
});

const StrategySchema = z.object({
  type: z.enum(["fixed", "flexible"]),
  minReplicas: z.number().optional(),
  maxReplicas: z.number().optional(),
  threshold: ThresholdSchema.optional(),
});

const OperationalStatusSchema = z.object({
  createdAt: z.string(),
});

export const StatefulsetObjectSchema = z.object({
  name: z.string(),
  kind: z.string(),
  image: z.string(),
  resource: ResourceSchema,
  status: z.string(),
  command: z.string().optional(),
  args: z.string().optional(),
  env: z.array(z.any()).optional(),
  ports: z.array(PortSchema).optional(),
  configMap: z.array(ConfigMapSchema).optional(),
  localStorage: z.array(LocalStorageSchema).optional(),
  pods: z.array(PodSchema).optional(),
  operationalStatus: OperationalStatusSchema.optional(),
  strategy: StrategySchema.optional(),
});

export type StatefulsetObject = z.infer<typeof StatefulsetObjectSchema>;
