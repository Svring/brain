import { z } from "zod";

const EnvVarSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
  valueFrom: z.object({
    secretKeyRef: z.object({
      key: z.string(),
      name: z.string(),
    }),
  }).optional(),
});

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
  replicas: z.number(),
  unavailableReplicas: z.number().optional(),
});

export const DeploymentObjectSchema = z.object({
  name: z.string(),
  image: z.string(),
  resource: ResourceSchema,
  status: StatusSchema,
  env: z.array(EnvVarSchema).optional(),
  ports: z.array(PortSchema).optional(),
});

export type DeploymentObject = z.infer<typeof DeploymentObjectSchema>;