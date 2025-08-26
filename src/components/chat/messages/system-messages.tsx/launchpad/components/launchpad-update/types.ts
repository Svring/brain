import { z } from "zod";

// CPU options for launchpad - updated to match OpenAPI spec (0.1-8 cores)
export const cpuOptions = [0.1, 0.2, 0.5, 1, 2, 3, 4, 8] as const;

// Memory options for launchpad - updated to match OpenAPI spec (0.1-16 GB)
export const memoryOptions = [0.1, 0.5, 1, 2, 4, 8, 16] as const;

// Replicas options for launchpad - updated to match OpenAPI spec (1-20)
export const replicasOptions = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

// Port protocol options for launchpad
export const portProtocolOptions = ["TCP", "UDP", "SCTP"] as const;

// App protocol options for launchpad
export const appProtocolOptions = ["HTTP", "GRPC", "WS"] as const;

// Storage size options for launchpad
export const storageSizeOptions = [
  "1Gi",
  "5Gi",
  "10Gi",
  "20Gi",
  "50Gi",
  "100Gi",
] as const;

// Port interface
export interface Port {
  port: number;
  protocol: "TCP" | "UDP" | "SCTP";
  appProtocol?: "HTTP" | "GRPC" | "WS";
  exposesPublicDomain: boolean;
}

// Port schema for form validation
export const portSchema = z.object({
  port: z
    .number()
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be less than 65536"),
  protocol: z.enum(["TCP", "UDP", "SCTP"]),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean(),
});

// Form schema with Zod validation
export const launchpadFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  image: z.string().min(1, "Image is required"),
  command: z.string().optional(),
  args: z.string().optional(),
  cpu: z.enum(cpuOptions.map((val) => val.toString()) as [string, ...string[]]),
  memory: z.enum(
    memoryOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  replicas: z.enum(
    replicasOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  ports: z.array(portSchema).min(1, "At least one port is required"),
  envVars: z.string().optional(),
  configMapPath: z.string().optional(),
  configMapValue: z.string().optional(),
  storageName: z.string().optional(),
  storagePath: z.string().optional(),
  storageSize: z.enum(storageSizeOptions),
});

// Update form schema (without name field since it's for updates)
export const launchpadUpdateFormSchema = z.object({
  image: z.string().min(1, "Image is required"),
  command: z.string().optional(),
  args: z.string().optional(),
  cpu: z.enum(cpuOptions.map((val) => val.toString()) as [string, ...string[]]),
  memory: z.enum(
    memoryOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  replicas: z.enum(
    replicasOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  ports: z.array(portSchema).min(1, "At least one port is required"),
  env: z.array(
    z.object({
      name: z.string(),
      value: z.string().optional(),
    })
  ),
});

export type LaunchpadFormValues = z.infer<typeof launchpadFormSchema>;
export type LaunchpadUpdateFormValues = z.infer<
  typeof launchpadUpdateFormSchema
>;

export interface DeploymentUpdateMessageProps {
  payload?: {
    name?: string;
    image?: string;
    command?: string;
    args?: string;
    cpu?: number;
    memory?: number;
    replicas?: number;
    ports?: string;
    portProtocol?: "TCP" | "UDP" | "SCTP";
    appProtocol?: "HTTP" | "GRPC" | "WS";
    exposesPublicDomain?: boolean;
    envVars?: string;
    storageName?: string;
    storagePath?: string;
    storageSize?: string;
    configMapPath?: string;
    configMapValue?: string;
  };
}

export interface LaunchpadUpdateMessageProps {
  target?: {
    type: "builtin";
    resourceType: string;
    name?: string;
    labelSelector?: string;
  };
  payload?: {
    resource?: {
      cpu?: number;
      memory?: number;
      replicas?: number;
    };
    image?: string;
    ports?: Array<{
      port: number;
      protocol: "TCP" | "UDP" | "SCTP";
      appProtocol?: "HTTP" | "GRPC" | "WS";
      exposesPublicDomain: boolean;
    }>;
    env?: Array<{
      name: string;
      value?: string;
    }>;
    launchpadName?: string;
    status?: string;
  };
}
