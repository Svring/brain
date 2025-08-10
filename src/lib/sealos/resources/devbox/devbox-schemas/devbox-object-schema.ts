import { z } from "zod";

export const DevboxResourceSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
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
  ingressName: z.string().optional(),
  host: z.string().optional(),
  publicAddress: z.string().optional(),
});

const PodSchema = z.object({
  name: z.string(),
  status: z.string(),
});

export const DevboxObjectSchema = z.object({
  name: z.string(),
  image: z.string(),
  status: z.string(),
  resources: DevboxResourceSchema,
  ssh: DevboxSshSchema,
  ports: z.array(DevboxPortSchema),
  pods: z.array(PodSchema).optional(),
});

export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
export type DevboxSsh = z.infer<typeof DevboxSshSchema>;
export type DevboxPort = z.infer<typeof DevboxPortSchema>;
export type DevboxObject = z.infer<typeof DevboxObjectSchema>;
