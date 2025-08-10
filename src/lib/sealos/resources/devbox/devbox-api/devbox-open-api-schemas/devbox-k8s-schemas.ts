import { z } from "zod";
import { K8sMetadataSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// Devbox port configuration schema for appPorts
export const DevboxAppPortSchema = z.object({
  name: z.string().optional(),
  port: z.number(),
  protocol: z.string(),
  targetPort: z.number().optional(),
  containerPort: z.number().optional(),
});

// Devbox SSH port configuration schema
export const DevboxSSHPortSchema = z.object({
  containerPort: z.number(),
  name: z.string().optional(),
  protocol: z.string(),
  port: z.number().optional(),
});

// Devbox network configuration schema
export const DevboxNetworkSchema = z.object({
  type: z.string(),
  extraPorts: z
    .array(
      z.object({
        containerPort: z.number(),
        protocol: z.string(),
      })
    )
    .optional(),
  nodePort: z.number().optional(),
  tailnet: z.string().optional(),
});

// Devbox resource configuration schema
export const DevboxResourceSchema = z.object({
  cpu: z.string(),
  memory: z.string(),
});

// Devbox config schema
export const DevboxConfigSchema = z.object({
  appPorts: z.array(DevboxAppPortSchema).optional(),
  ports: z.array(DevboxSSHPortSchema).optional(),
  releaseArgs: z.array(z.string()).optional(),
  releaseCommand: z.array(z.string()).optional(),
  user: z.string().optional(),
  workingDir: z.string().optional(),
});

// Devbox spec schema
export const DevboxSpecSchema = z.object({
  affinity: z.record(z.unknown()).optional(),
  config: DevboxConfigSchema,
  image: z.string(),
  network: DevboxNetworkSchema.optional(),
  resource: DevboxResourceSchema,
  squash: z.boolean().optional(),
  state: z.string(),
  templateID: z.string().optional(),
  tolerations: z.array(z.record(z.unknown())).optional(),
});

// Devbox commit history schema
export const DevboxCommitHistorySchema = z.object({
  containerID: z.string().optional(),
  image: z.string().optional(),
  node: z.string().optional(),
  pod: z.string().optional(),
  predicatedStatus: z.string().optional(),
  status: z.string().optional(),
  time: z.string().optional(),
});

// Devbox status schema
export const DevboxStatusSchema = z.object({
  commitHistory: z.array(DevboxCommitHistorySchema).optional(),
  lastState: z.record(z.unknown()).optional(),
  network: DevboxNetworkSchema.optional(),
  phase: z.string(),
  state: z
    .object({
      running: z
        .object({
          startedAt: z.string(),
        })
        .optional(),
    })
    .optional(),
});

// Complete Devbox resource schema
export const DevboxResourceK8sSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Devbox"),
  metadata: K8sMetadataSchema,
  spec: DevboxSpecSchema,
  status: DevboxStatusSchema.optional(),
});

// Devbox Secret schema
export const DevboxSecretSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: K8sMetadataSchema,
  type: z.string(),
  data: z.object({
    SEALOS_DEVBOX_AUTHORIZED_KEYS: z.string(),
    SEALOS_DEVBOX_JWT_SECRET: z.string(),
    SEALOS_DEVBOX_PRIVATE_KEY: z.string(),
    SEALOS_DEVBOX_PUBLIC_KEY: z.string(),
  }),
});

// Devbox Pod schema
export const DevboxPodSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: K8sMetadataSchema,
  spec: z.record(z.unknown()).optional(),
  status: z.record(z.unknown()).optional(),
});

// Devbox list schema
export const DevboxListSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("DevboxList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
    })
    .optional(),
  items: z.array(DevboxResourceK8sSchema),
});

// Ingress backend service port schema
export const IngressServicePortSchema = z.object({
  number: z.number(),
  name: z.string().optional(),
});

// Ingress backend service schema
export const IngressBackendServiceSchema = z.object({
  name: z.string(),
  port: IngressServicePortSchema,
});

// Ingress backend schema
export const IngressBackendSchema = z.object({
  service: IngressBackendServiceSchema,
  resource: z.record(z.unknown()).optional(),
});

// Ingress HTTP path schema
export const IngressHttpPathSchema = z.object({
  backend: IngressBackendSchema,
  path: z.string(),
  pathType: z.enum(["Exact", "Prefix", "ImplementationSpecific"]),
});

// Ingress HTTP schema
export const IngressHttpSchema = z.object({
  paths: z.array(IngressHttpPathSchema),
});

// Ingress rule schema
export const IngressRuleSchema = z.object({
  host: z.string().optional(),
  http: IngressHttpSchema.optional(),
});

// Ingress TLS schema
export const IngressTlsSchema = z.object({
  hosts: z.array(z.string()).optional(),
  secretName: z.string().optional(),
});

// Ingress spec schema
export const IngressSpecSchema = z.object({
  defaultBackend: IngressBackendSchema.optional(),
  ingressClassName: z.string().optional(),
  rules: z.array(IngressRuleSchema).optional(),
  tls: z.array(IngressTlsSchema).optional(),
});

// Ingress status schema
export const IngressStatusSchema = z.object({
  loadBalancer: z
    .object({
      ingress: z
        .array(
          z.object({
            hostname: z.string().optional(),
            ip: z.string().optional(),
            ports: z
              .array(
                z.object({
                  error: z.string().optional(),
                  port: z.number(),
                  protocol: z.string(),
                })
              )
              .optional(),
          })
        )
        .optional(),
    })
    .optional(),
});

// Complete Devbox Ingress resource schema
export const DevboxIngressSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal("Ingress"),
  metadata: K8sMetadataSchema,
  spec: IngressSpecSchema.optional(),
  status: IngressStatusSchema.optional(),
}); // Devbox Secret schema

// Type exports
export type IngressServicePort = z.infer<typeof IngressServicePortSchema>;
export type IngressBackendService = z.infer<typeof IngressBackendServiceSchema>;
export type IngressBackend = z.infer<typeof IngressBackendSchema>;
export type IngressHttpPath = z.infer<typeof IngressHttpPathSchema>;
export type IngressHttp = z.infer<typeof IngressHttpSchema>;
export type IngressRule = z.infer<typeof IngressRuleSchema>;
export type IngressTls = z.infer<typeof IngressTlsSchema>;
export type IngressSpec = z.infer<typeof IngressSpecSchema>;
export type IngressStatus = z.infer<typeof IngressStatusSchema>;
export type DevboxIngress = z.infer<typeof DevboxIngressSchema>;
export type DevboxAppPort = z.infer<typeof DevboxAppPortSchema>;
export type DevboxSSHPort = z.infer<typeof DevboxSSHPortSchema>;
export type DevboxNetwork = z.infer<typeof DevboxNetworkSchema>;
export type DevboxResource = z.infer<typeof DevboxResourceSchema>;
export type DevboxConfig = z.infer<typeof DevboxConfigSchema>;
export type DevboxSpec = z.infer<typeof DevboxSpecSchema>;
export type DevboxCommitHistory = z.infer<typeof DevboxCommitHistorySchema>;
export type DevboxStatus = z.infer<typeof DevboxStatusSchema>;
export type DevboxResourceK8s = z.infer<typeof DevboxResourceK8sSchema>;
export type DevboxSecret = z.infer<typeof DevboxSecretSchema>;
export type DevboxPod = z.infer<typeof DevboxPodSchema>;
export type DevboxList = z.infer<typeof DevboxListSchema>;
