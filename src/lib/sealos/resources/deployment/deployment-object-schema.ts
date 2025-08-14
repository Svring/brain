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
  ingressName: z.string().optional(),
  host: z.string().optional(),
});

const ResourceSchema = z.object({
  replicas: z.number(),
  cpu: z.string(),
  memory: z.string(),
});

const StatusSchema = z.object({
  paused: z.boolean().optional(),
  replicas: z.number().optional(),
  unavailableReplicas: z.number().optional(),
  readyReplicas: z.number().optional(),
  availableReplicas: z.number().optional(),
});

const PodSchema = z.object({
  name: z.string(),
  status: z.string(),
  containers: z.any(),
});

export const DeploymentObjectSchema = z.object({
  name: z.string(),
  kind: z.string(),
  image: z.string(),
  resource: ResourceSchema,
  status: StatusSchema,
  env: z.any().optional(),
  ports: z.array(PortSchema).optional(),
  pods: z.array(PodSchema).optional(),
});

export type DeploymentObject = z.infer<typeof DeploymentObjectSchema>;
