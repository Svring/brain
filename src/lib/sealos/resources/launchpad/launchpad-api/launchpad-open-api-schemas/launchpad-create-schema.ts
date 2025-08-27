import { z } from "zod";

// GPU resource configuration schema
const GpuResourceSchema = z.object({
  vendor: z.string().default("nvidia"),
  type: z.string(),
  amount: z.number().default(1),
});

// CPU options for launchpad - enum constraints
export const cpuOptions = [0.1, 0.2, 0.5, 1, 2, 3, 4, 8] as const;

// Memory options for launchpad - enum constraints
export const memoryOptions = [0.1, 0.5, 1, 2, 4, 8, 16] as const;

// Replicas options for launchpad - enum constraints
export const replicasOptions = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

// Storage size options for launchpad
export const storageSizeOptions = ["1Gi", "5Gi", "10Gi", "20Gi"] as const;

// Resource configuration schema - updated to match OpenAPI spec with enum constraints
// Helper function to create a Zod union schema from an array of numbers
const createNumberUnionSchema = <T extends readonly number[]>(options: T) =>
  z.union(options.map((value) => z.literal(value)) as any);

// Resource configuration schema
const ResourceSchema = z.object({
  replicas: createNumberUnionSchema(replicasOptions).default(1),
  cpu: createNumberUnionSchema(cpuOptions).default(0.2),
  memory: createNumberUnionSchema(memoryOptions).default(0.5),
  gpu: z.any().optional(), // Assuming GpuResourceSchema is defined elsewhere
});

// Port configuration schema (for create requests)
const PortSchema = z.object({
  port: z.number().default(80),
  protocol: z.enum(["TCP", "UDP", "SCTP"]).default("TCP"),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean().default(false),
});

// Extended port schema (for GET responses with additional runtime fields)
const ExtendedPortSchema = z.object({
  serviceName: z.string().optional(),
  port: z.number().default(80),
  protocol: z.enum(["TCP", "UDP", "SCTP"]).default("TCP"),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean().default(true),
  networkName: z.string().default("network-muqhstfkrung"),
  portName: z.string().default("yakkrftqqfxg"),
  publicDomain: z.string().default("mbyrxxkwqxms"),
  domain: z.string().default(""),
  customDomain: z.string().optional(),
  nodePort: z.number().optional(),
});

// Environment variable schema
const EnvSchema = z.object({
  name: z.string(),
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

// Horizontal Pod Autoscaler schema
const HpaSchema = z.object({
  target: z.enum(["cpu", "memory", "gpu"]),
  value: z.number(),
  minReplicas: z.number(),
  maxReplicas: z.number(),
});

// Image registry schema
const ImageRegistrySchema = z.object({
  username: z.string(),
  password: z.string(),
  serverAddress: z.string(),
});

// Storage configuration schema
const StorageSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.enum(storageSizeOptions).default("1Gi"),
});

// ConfigMap configuration schema (for create requests)
const ConfigMapSchema = z.object({
  path: z.string(),
  value: z.string().optional(),
});

// Extended ConfigMap schema (for GET responses with additional fields)
const ExtendedConfigMapSchema = z.object({
  name: z.string(),
  path: z.string(),
  key: z.string().optional(),
  value: z.string().optional(),
});

// Application status schema
const ApplicationStatusSchema = z.object({
  observedGeneration: z.number(),
  replicas: z.number(),
  availableReplicas: z.number(),
  updatedReplicas: z.number(),
  isPause: z.boolean().default(false),
});

// Main request schema for creating launchpad application
export const LaunchpadCreateRequestSchema = z.object({
  name: z.string().default("hello-world"),
  image: z.string().default("nginx"),
  command: z.string().default(""),
  args: z.string().default(""),
  resource: ResourceSchema.default({
    replicas: 1,
    cpu: 0.2,
    memory: 0.5,
  }),
  ports: z.array(PortSchema).default([
    {
      port: 80,
      protocol: "TCP",
      appProtocol: "HTTP",
      exposesPublicDomain: true,
    },
  ]),
  env: z.array(EnvSchema).default([]),
  hpa: HpaSchema.nullable().default(null),
  imageRegistry: ImageRegistrySchema.nullable().default(null),
  storage: z.array(StorageSchema).default([]),
  configMap: z.array(ConfigMapSchema).default([]),
});

// Success response schema
export const LaunchpadCreateSuccessResponseSchema = z.object({
  data: z.object({
    name: z.string(),
    image: z.string(),
    command: z.string().optional(),
    args: z.string().optional(),
    resource: z.object({
      replicas: z.number(),
      cpu: z.number(),
      memory: z.number(),
      gpu: GpuResourceSchema.optional(),
    }),
    ports: z.array(ExtendedPortSchema),
    env: z.array(EnvSchema),
    hpa: HpaSchema.optional(),
    imageRegistry: ImageRegistrySchema.optional(),
    storage: z.array(StorageSchema),
    configMap: z.array(ExtendedConfigMapSchema),
    kind: z.enum(["deployment", "statefulset"]),
    id: z.string(),
    createTime: z.string(),
    status: ApplicationStatusSchema,
  }),
});

// Error response schema (400/500)
export const LaunchpadCreateErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.string().optional(),
  error: z.string().optional(),
});

// ============= GET /api/v1/app/{name} SCHEMAS =============

// Extended resource schema for GET responses (with required fields)
const ExtendedResourceSchema = z.object({
  replicas: z.number(),
  cpu: z.number(),
  memory: z.number(),
  gpu: GpuResourceSchema.optional(),
});

// GET response schema for application details
export const LaunchpadGetResponseSchema = z.object({
  data: z.object({
    name: z.string(),
    image: z.string(),
    command: z.string().optional(),
    args: z.string().optional(),
    resource: ExtendedResourceSchema,
    ports: z.array(ExtendedPortSchema),
    env: z.array(EnvSchema).optional(),
    hpa: HpaSchema.optional(),
    imageRegistry: ImageRegistrySchema.optional(),
    storage: z.array(StorageSchema).optional(),
    configMap: z.array(ExtendedConfigMapSchema).optional(),
    kind: z.enum(["deployment", "statefulset"]).optional(),
    id: z.string(),
    createTime: z.string(),
    status: ApplicationStatusSchema,
  }),
});

// ============= PATCH /api/v1/app/{name} SCHEMAS =============

// PATCH request schema (partial update) - updated to match OpenAPI spec
export const LaunchpadPatchRequestSchema = z.object({
  resource: z
    .object({
      cpu: z.number().min(0.1).max(8).optional(),
      memory: z.number().min(0.1).max(16).optional(),
      replicas: z.number().min(1).max(20).optional(),
    })
    .optional(),
  command: z.string().optional(),
  args: z.string().optional(),
  image: z.string().optional(),
  env: z.array(EnvSchema).optional(),
});

// PATCH response schema
export const LaunchpadPatchResponseSchema = z.object({
  data: z.array(z.any()).nullable(),
});

// ============= DELETE /api/v1/app/{name} SCHEMAS =============

// DELETE response schema
export const LaunchpadDeleteResponseSchema = z.object({
  message: z.string(),
});

// ============= GET /api/v1/pod/getAppPodsByAppName SCHEMAS =============

// Pod status schema
const PodStatusSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
  reason: z.string().optional(),
  message: z.string().optional(),
});

// Pod metrics schema
const PodMetricsSchema = z.object({
  name: z.string().optional(),
  xData: z.array(z.number()),
  yData: z.array(z.string()),
});

// Pod schema
const PodSchema = z
  .object({
    name: z.string(),
    status: PodStatusSchema,
    nodeName: z.string(),
    ip: z.string(),
    restarts: z.number(),
    age: z.string(),
    cpuStats: PodMetricsSchema,
    memoryStats: PodMetricsSchema,
    cpu: z.number(),
    memory: z.number(),
    podReason: z.string().optional(),
    podMessage: z.string().optional(),
    containerStatus: PodStatusSchema,
  })
  .and(z.record(z.any())); // Allow additional properties

// GET pods response schema
export const LaunchpadGetPodsResponseSchema = z.object({
  data: z.array(PodSchema),
});

// ============= POST /api/v1/pod/getPodsMetrics SCHEMAS =============

// Pods metrics request schema
export const LaunchpadPodsMetricsRequestSchema = z.object({
  podsName: z.array(z.string()),
});

// Pods metrics response schema
export const LaunchpadPodsMetricsResponseSchema = z.object({
  data: z.any(), // Generic object as the schema doesn't specify structure
});

// ============= PATCH /api/v1/app/{name}/configmap SCHEMAS =============

// ConfigMap update request schema
export const LaunchpadConfigMapUpdateRequestSchema = z.object({
  configMap: z
    .array(
      z.object({
        path: z.string().describe("Mount path in the container"),
        value: z
          .string()
          .optional()
          .describe("Configuration value or file content"),
      })
    )
    .default([])
    .describe("ConfigMap configurations"),
});

// ConfigMap update response schema (same as GET response)
export const LaunchpadConfigMapUpdateResponseSchema =
  LaunchpadGetResponseSchema;

// ============= POST /api/v1/app/{name}/ports SCHEMAS =============

// Port create request schema (for new ports only)
export const LaunchpadPortsCreateRequestSchema = z.object({
  ports: z
    .array(
      z.object({
        port: z.number().default(80),
        protocol: z.enum(["TCP", "UDP", "SCTP"]),
        appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
        exposesPublicDomain: z.boolean(),
      })
    )
    .min(1)
    .describe("Port configurations to create (new ports only)"),
});

// ============= PATCH /api/v1/app/{name}/ports SCHEMAS =============

// Port update request schema (for existing ports)
export const LaunchpadPortsUpdateRequestSchema = z.object({
  ports: z
    .array(
      z.object({
        port: z.number(),
        protocol: z.enum(["TCP", "UDP", "SCTP"]),
        appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
        exposesPublicDomain: z.boolean(),
        networkName: z.string().optional(),
        portName: z.string().optional(),
        serviceName: z.string().optional(),
      })
    )
    .min(1)
    .describe(
      "Port configurations to update. Must include at least one identifier (networkName/portName/serviceName) to locate existing port"
    ),
});

// Port update response schema (same as GET response)
export const LaunchpadPortsUpdateResponseSchema = LaunchpadGetResponseSchema;

// ============= DELETE /api/v1/app/{name}/ports SCHEMAS =============

// Port delete request schema
export const LaunchpadPortsDeleteRequestSchema = z.object({
  ports: z.array(z.number()).min(1).describe("Array of port numbers to delete"),
});

// ============= PATCH /api/v1/app/{name}/storage SCHEMAS =============

// Storage update request schema (simplified - name auto-generated from path)
export const LaunchpadStorageUpdateRequestSchema = z.object({
  storage: z
    .array(
      z.object({
        path: z.string().describe("Mount path in the container"),
        size: z
          .string()
          .default("1Gi")
          .describe('Storage size (e.g., "10Gi", "1Ti")'),
      })
    )
    .default([])
    .describe(
      "Storage configurations to update (incremental). Only includes storage to add or modify, existing storage not listed will be preserved. Name is auto-generated from path."
    ),
});

// Storage update response schema (same as GET response)
export const LaunchpadStorageUpdateResponseSchema = LaunchpadGetResponseSchema;

// Export types
export type LaunchpadCreateRequest = z.infer<
  typeof LaunchpadCreateRequestSchema
>;
export type LaunchpadCreateSuccessResponse = z.infer<
  typeof LaunchpadCreateSuccessResponseSchema
>;
export type LaunchpadCreateErrorResponse = z.infer<
  typeof LaunchpadCreateErrorResponseSchema
>;
export type LaunchpadGetResponse = z.infer<typeof LaunchpadGetResponseSchema>;
export type LaunchpadPatchRequest = z.infer<typeof LaunchpadPatchRequestSchema>;
export type LaunchpadPatchResponse = z.infer<
  typeof LaunchpadPatchResponseSchema
>;
export type LaunchpadDeleteResponse = z.infer<
  typeof LaunchpadDeleteResponseSchema
>;
export type LaunchpadGetPodsResponse = z.infer<
  typeof LaunchpadGetPodsResponseSchema
>;
export type LaunchpadPodsMetricsRequest = z.infer<
  typeof LaunchpadPodsMetricsRequestSchema
>;
export type LaunchpadPodsMetricsResponse = z.infer<
  typeof LaunchpadPodsMetricsResponseSchema
>;
export type LaunchpadConfigMapUpdateRequest = z.infer<
  typeof LaunchpadConfigMapUpdateRequestSchema
>;
export type LaunchpadConfigMapUpdateResponse = z.infer<
  typeof LaunchpadConfigMapUpdateResponseSchema
>;
export type LaunchpadPortsCreateRequest = z.infer<
  typeof LaunchpadPortsCreateRequestSchema
>;
export type LaunchpadPortsUpdateRequest = z.infer<
  typeof LaunchpadPortsUpdateRequestSchema
>;
export type LaunchpadPortsUpdateResponse = z.infer<
  typeof LaunchpadPortsUpdateResponseSchema
>;
export type LaunchpadPortsDeleteRequest = z.infer<
  typeof LaunchpadPortsDeleteRequestSchema
>;
export type LaunchpadStorageUpdateRequest = z.infer<
  typeof LaunchpadStorageUpdateRequestSchema
>;
export type LaunchpadStorageUpdateResponse = z.infer<
  typeof LaunchpadStorageUpdateResponseSchema
>;

// Re-export individual schemas for flexibility
export {
  GpuResourceSchema,
  ResourceSchema,
  PortSchema,
  ExtendedPortSchema,
  EnvSchema,
  HpaSchema,
  ImageRegistrySchema,
  StorageSchema,
  ConfigMapSchema,
  ExtendedConfigMapSchema,
  ExtendedResourceSchema,
  ApplicationStatusSchema,
  PodStatusSchema,
  PodMetricsSchema,
  PodSchema,
};
