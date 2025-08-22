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
  cpu: z.string(),
  memory: z.string(),
  storage: z.string(),
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

const OperationalStatusSchema = z.object({
  createdAt: z.string(),
});

export const StatefulsetObjectSchema = z.object({
  name: z.string(),
  kind: z.string(),
  image: z.string(),
  resource: ResourceSchema,
  status: z.string(),
  env: z.array(z.any()).optional(),
  ports: z.array(PortSchema).optional(),
  configMap: z.array(ConfigMapSchema).optional(),
  localStorage: z.array(LocalStorageSchema).optional(),
  pods: z.array(PodSchema).optional(),
  operationalStatus: OperationalStatusSchema.optional(),
  strategy: z.any().optional(),
});

export type StatefulsetObject = z.infer<typeof StatefulsetObjectSchema>;
