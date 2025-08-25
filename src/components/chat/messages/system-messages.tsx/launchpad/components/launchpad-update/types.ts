import { z } from "zod";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// CPU options for launchpad
export const cpuOptions = [500, 1000, 2000, 4000, 6000, 8000] as const;

// Memory options for launchpad
export const memoryOptions = [512, 1024, 2048, 4096, 8192, 16000] as const;

// Replicas options for launchpad
export const replicasOptions = [1, 2, 3, 5, 10] as const;

// Port protocol options for launchpad
export const portProtocolOptions = ["TCP", "UDP", "SCTP"] as const;

// App protocol options for launchpad
export const appProtocolOptions = ["HTTP", "GRPC", "WS"] as const;

// Port schema for form validation
export const portSchema = z.object({
  port: z
    .number()
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be less than 65536"),
  protocol: z.enum(["TCP", "UDP", "SCTP"]),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional().or(z.undefined()),
  exposesPublicDomain: z.boolean(),
});

// Environment variable schema
export const envSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().optional(),
  valueFrom: z
    .object({
      secretKeyRef: z.object({
        key: z.string(),
        name: z.string(),
      }),
    })
    .optional(),
});

// Form schema with Zod validation
export const launchpadUpdateFormSchema = z.object({
  image: z.string().min(1, "Image is required"),
  cpu: z.enum(cpuOptions.map((val) => val.toString()) as [string, ...string[]]),
  memory: z.enum(
    memoryOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  replicas: z.enum(
    replicasOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  ports: z.array(portSchema),
  env: z.array(envSchema),
});

export type LaunchpadUpdateFormValues = z.infer<
  typeof launchpadUpdateFormSchema
>;

export interface LaunchpadResource {
  cpu: number;
  memory: number;
  replicas: number;
}

export interface LaunchpadPort {
  port: number;
  protocol: "TCP" | "UDP" | "SCTP";
  appProtocol?: "HTTP" | "GRPC" | "WS";
  exposesPublicDomain: boolean;
}

export interface LaunchpadEnv {
  name: string;
  value?: string;
  valueFrom?: {
    secretKeyRef: {
      key: string;
      name: string;
    };
  };
}

export interface LaunchpadUpdateMessageProps {
  target: BuiltinResourceTarget;
  payload?: {
    target?: BuiltinResourceTarget;
    resource?: LaunchpadResource;
    image?: string;
    ports?: LaunchpadPort[];
    env?: LaunchpadEnv[];
    launchpadName?: string;
    status?: string;
  };
}
