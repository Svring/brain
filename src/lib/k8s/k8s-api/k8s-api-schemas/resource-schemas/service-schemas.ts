import { z } from "zod";
import { KubernetesMetadataSchema } from "./kubernetes-resource-schemas";

// Service-specific schemas
export const ServicePortSchema = z.object({
  name: z.string().optional(),
  protocol: z.enum(["TCP", "UDP", "SCTP"]).optional(),
  port: z.number(),
  targetPort: z.union([z.string(), z.number()]).optional(),
  nodePort: z.number().optional(),
  appProtocol: z.string().optional(),
});

export const ServiceSpecSchema = z.object({
  ports: z.array(ServicePortSchema).optional(),
  selector: z.record(z.string()).optional(),
  clusterIP: z.string().optional(),
  clusterIPs: z.array(z.string()).optional(),
  type: z
    .enum(["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"])
    .optional(),
  externalIPs: z.array(z.string()).optional(),
  sessionAffinity: z.enum(["ClientIP", "None"]).optional(),
  sessionAffinityConfig: z
    .object({
      clientIP: z
        .object({
          timeoutSeconds: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  loadBalancerIP: z.string().optional(),
  loadBalancerSourceRanges: z.array(z.string()).optional(),
  externalName: z.string().optional(),
  externalTrafficPolicy: z.enum(["Local", "Cluster"]).optional(),
  healthCheckNodePort: z.number().optional(),
  publishNotReadyAddresses: z.boolean().optional(),
  ipFamilyPolicy: z
    .enum(["SingleStack", "PreferDualStack", "RequireDualStack"])
    .optional(),
  ipFamilies: z.array(z.enum(["IPv4", "IPv6"])).optional(),
  allocateLoadBalancerNodePorts: z.boolean().optional(),
  loadBalancerClass: z.string().optional(),
  internalTrafficPolicy: z.enum(["Local", "Cluster"]).optional(),
});

export const ServiceStatusSchema = z.object({
  loadBalancer: z
    .object({
      ingress: z
        .array(
          z.object({
            ip: z.string().optional(),
            hostname: z.string().optional(),
            ports: z
              .array(
                z.object({
                  port: z.number(),
                  protocol: z.enum(["TCP", "UDP", "SCTP"]),
                  error: z.string().optional(),
                })
              )
              .optional(),
          })
        )
        .optional(),
    })
    .optional(),
  conditions: z
    .array(
      z.object({
        type: z.string(),
        status: z.enum(["True", "False", "Unknown"]),
        lastTransitionTime: z.string().optional(),
        reason: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .optional(),
});

export const ServiceResourceSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("Service"),
  metadata: KubernetesMetadataSchema,
  spec: ServiceSpecSchema.optional(),
  status: ServiceStatusSchema.optional(),
});

export const ServiceListSchema = z.object({
  apiVersion: z.literal("v1"),
  kind: z.literal("ServiceList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(ServiceResourceSchema),
});

// Inferred types for Service resources
export type ServicePort = z.infer<typeof ServicePortSchema>;
export type ServiceSpec = z.infer<typeof ServiceSpecSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type ServiceResource = z.infer<typeof ServiceResourceSchema>;
export type ServiceList = z.infer<typeof ServiceListSchema>;
