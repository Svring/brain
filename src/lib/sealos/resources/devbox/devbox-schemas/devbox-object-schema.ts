import { z } from "zod";

export const DevboxResourceSchema = z.object({
  cpu: z.number(),
  memory: z.number(),
});

export const DevboxSshSchema = z.object({
  host: z.string(),
  port: z.number(),
  user: z.string(),
  workingDir: z.string(),
  privateKey: z.string().optional(),
});

export const DevboxPortSchema = z.object({
  number: z.number(),
  name: z.string().optional(),
  protocol: z.string().optional(),
  serviceName: z.string().optional(),
  privateAddress: z.string().optional(),
  networkName: z.string().optional(),
  host: z.string().optional(),
  publicAddress: z.string().optional(),
});

const PodSchema = z.object({
  name: z.string(),
  status: z.string(),
});

export const DevboxObjectSchema = z.object({
  name: z.string(),
  id: z.string(),
  kind: z.string(),
  runtime: z.string(),
  image: z.string(),
  status: z.string(),
  resources: DevboxResourceSchema,
  ssh: DevboxSshSchema,
  env: z.any().optional(),
  ports: z.array(DevboxPortSchema),
  pods: z.array(PodSchema).optional(),
  operationalStatus: z.any().optional(),
});

export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
export type DevboxSsh = z.infer<typeof DevboxSshSchema>;
export type DevboxPort = z.infer<typeof DevboxPortSchema>;
export type DevboxObject = z.infer<typeof DevboxObjectSchema>;
