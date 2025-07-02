import { z } from "zod";

// Network protocol schemas
export const NetworkProtocolSchema = z.enum(["TCP", "UDP", "SCTP"]);
export const AppProtocolSchema = z.enum(["HTTP", "GRPC", "WS"]);

// GPU configuration schema
export const GpuConfigSchema = z.object({
  manufacturers: z.string().default("nvidia"),
  type: z.string().default(""),
  amount: z.number().default(1),
});

// Network configuration schema
export const NetworkConfigSchema = z.object({
  networkName: z.string().optional().default(""),
  portName: z.string().optional().default("default-port"),
  port: z.number().default(80),
  protocol: NetworkProtocolSchema.default("TCP"),
  appProtocol: AppProtocolSchema.default("HTTP"),
  openPublicDomain: z.boolean().default(false),
  publicDomain: z.string().optional().default(""),
  customDomain: z.string().optional().default(""),
  domain: z.string().optional().default(""),
  nodePort: z.number().optional(),
  openNodePort: z.boolean().default(false),
});

// Environment variable schema
export const EnvVarSchema = z.object({
  key: z.string(),
  value: z.string(),
  valueFrom: z.unknown().optional(),
});

// HPA configuration schema
export const HpaConfigSchema = z.object({
  use: z.boolean().default(false),
  target: z.enum(["cpu", "memory", "gpu"]).default("cpu"),
  value: z.number().default(50),
  minReplicas: z.number().default(1),
  maxReplicas: z.number().default(5),
});

// Secret configuration schema
export const SecretConfigSchema = z.object({
  use: z.boolean().default(false),
  username: z.string().optional().default(""),
  password: z.string().optional().default(""),
  serverAddress: z.string().optional().default("docker.io"),
});

// ConfigMap schema
export const ConfigMapSchema = z.object({
  mountPath: z.string(),
  value: z.string(),
});

// Storage schema
export const StorageSchema = z.object({
  name: z.string(),
  path: z.string(),
  value: z.number(),
});

// App form configuration schema
export const AppFormConfigSchema = z.object({
  appName: z.string().default("hello-world"),
  imageName: z.string().default("nginx"),
  runCMD: z.string().optional().default(""),
  cmdParam: z.string().optional().default(""),
  replicas: z
    .union([z.number(), z.literal("")])
    .optional()
    .default(1),
  cpu: z.number().optional().default(200),
  memory: z.number().optional().default(256),
  gpu: GpuConfigSchema.optional(),
  networks: z
    .array(NetworkConfigSchema)
    .optional()
    .default([
      {
        networkName: "",
        portName: "default-port",
        port: 80,
        protocol: "TCP",
        appProtocol: "HTTP",
        openPublicDomain: false,
        openNodePort: false,
        publicDomain: "",
        customDomain: "",
        domain: "",
      },
    ]),
  envs: z.array(EnvVarSchema).optional().default([]),
  hpa: HpaConfigSchema,
  secret: SecretConfigSchema,
  configMapList: z.array(ConfigMapSchema).optional().default([]),
  storeList: z.array(StorageSchema).optional().default([]),
  labels: z.record(z.string()).optional().default({}),
  volumes: z.array(z.unknown()).optional().default([]),
  volumeMounts: z.array(z.unknown()).optional().default([]),
  kind: z.enum(["deployment", "statefulset"]).default("deployment"),
});

// Create app schemas
export const CreateAppRequestSchema = z.object({
  appForm: AppFormConfigSchema,
});

export const CreateAppResponseSchema = z.object({
  data: z.string().default("success"),
});

// App status schema
export const AppStatusSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
  backgroundColor: z.string(),
  dotColor: z.string(),
});

// App metrics schema
export const AppMetricsSchema = z.object({
  name: z.string(),
  xData: z.array(z.number()),
  yData: z.array(z.string()),
});

// App source schema
export const AppSourceSchema = z.object({
  hasSource: z.boolean(),
  sourceName: z.string(),
  sourceType: z.string(),
});

// App info schema
export const AppInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: AppStatusSchema,
  isPause: z.boolean(),
  createTime: z.string(),
  cpu: z.number(),
  memory: z.number(),
  gpu: GpuConfigSchema,
  usedCpu: AppMetricsSchema,
  usedMemory: AppMetricsSchema,
  activeReplicas: z.number(),
  minReplicas: z.number(),
  maxReplicas: z.number(),
  storeAmount: z.number(),
  labels: z.record(z.string()),
  source: AppSourceSchema,
});

// Get apps response schema
export const GetAppsResponseSchema = z.object({
  data: z.array(AppInfoSchema),
});

// Get app by name schemas
export const GetAppByNameRequestSchema = z.object({
  appName: z.string().min(1, "App name is required"),
});

export const GetAppByNameResponseSchema = z.object({
  data: z.array(z.unknown()).nullable(),
});

// Delete app schemas
export const DeleteAppRequestSchema = z.object({
  name: z.string().min(1, "App name is required"),
});

export const DeleteAppResponseSchema = z.object({
  message: z.string(),
});

// Pod status schema
export const PodStatusSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
  reason: z.string().optional(),
  message: z.string().optional(),
});

// Container status schema
export const ContainerStatusSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
  reason: z.string().optional(),
  message: z.string().optional(),
});

// App pod info schema
export const AppPodInfoSchema = z.object({
  podName: z.string(),
  status: PodStatusSchema,
  nodeName: z.string(),
  ip: z.string(),
  restarts: z.number(),
  age: z.string(),
  usedCpu: AppMetricsSchema,
  usedMemory: AppMetricsSchema,
  cpu: z.number(),
  memory: z.number(),
  podReason: z.string(),
  podMessage: z.string(),
  containerStatus: ContainerStatusSchema,
});

// Get app pods schemas
export const GetAppPodsRequestSchema = z.object({
  name: z.string().min(1, "App name is required"),
});

export const GetAppPodsResponseSchema = z.object({
  data: z.array(AppPodInfoSchema),
});

// Application error response schema
export const AppErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.string().optional(),
});

// Type exports
export type NetworkProtocol = z.infer<typeof NetworkProtocolSchema>;
export type AppProtocol = z.infer<typeof AppProtocolSchema>;
export type GpuConfig = z.infer<typeof GpuConfigSchema>;
export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
export type HpaConfig = z.infer<typeof HpaConfigSchema>;
export type SecretConfig = z.infer<typeof SecretConfigSchema>;
export type ConfigMap = z.infer<typeof ConfigMapSchema>;
export type Storage = z.infer<typeof StorageSchema>;
export type AppFormConfig = z.infer<typeof AppFormConfigSchema>;
export type CreateAppRequest = z.infer<typeof CreateAppRequestSchema>;
export type CreateAppResponse = z.infer<typeof CreateAppResponseSchema>;
export type AppStatus = z.infer<typeof AppStatusSchema>;
export type AppMetrics = z.infer<typeof AppMetricsSchema>;
export type AppSource = z.infer<typeof AppSourceSchema>;
export type AppInfo = z.infer<typeof AppInfoSchema>;
export type GetAppsResponse = z.infer<typeof GetAppsResponseSchema>;
export type GetAppByNameRequest = z.infer<typeof GetAppByNameRequestSchema>;
export type GetAppByNameResponse = z.infer<typeof GetAppByNameResponseSchema>;
export type DeleteAppRequest = z.infer<typeof DeleteAppRequestSchema>;
export type DeleteAppResponse = z.infer<typeof DeleteAppResponseSchema>;
export type PodStatus = z.infer<typeof PodStatusSchema>;
export type ContainerStatus = z.infer<typeof ContainerStatusSchema>;
export type AppPodInfo = z.infer<typeof AppPodInfoSchema>;
export type GetAppPodsRequest = z.infer<typeof GetAppPodsRequestSchema>;
export type GetAppPodsResponse = z.infer<typeof GetAppPodsResponseSchema>;
export type AppErrorResponse = z.infer<typeof AppErrorResponseSchema>;
