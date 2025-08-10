import { z } from "zod";
import { K8sMetadataSchema } from "./kubernetes-resource-schemas";

// Ingress-specific schemas
export const IngressBackendSchema = z.object({
  service: z
    .object({
      name: z.string(),
      port: z
        .object({
          name: z.string().optional(),
          number: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  resource: z
    .object({
      apiGroup: z.string().optional(),
      kind: z.string(),
      name: z.string(),
    })
    .optional(),
});

export const IngressPathSchema = z.object({
  path: z.string().optional(),
  pathType: z.enum(["Exact", "Prefix", "ImplementationSpecific"]),
  backend: IngressBackendSchema,
});

export const IngressRuleSchema = z.object({
  host: z.string().optional(),
  http: z
    .object({
      paths: z.array(IngressPathSchema),
    })
    .optional(),
});

export const IngressTLSSchema = z.object({
  hosts: z.array(z.string()).optional(),
  secretName: z.string().optional(),
});

export const IngressSpecSchema = z.object({
  ingressClassName: z.string().optional(),
  defaultBackend: IngressBackendSchema.optional(),
  tls: z.array(IngressTLSSchema).optional(),
  rules: z.array(IngressRuleSchema).optional(),
});

export const IngressPortStatusSchema = z.object({
  port: z.number(),
  protocol: z.enum(["TCP", "UDP", "SCTP"]),
  error: z.string().optional(),
});

export const IngressLoadBalancerIngressSchema = z.object({
  ip: z.string().optional(),
  hostname: z.string().optional(),
  ports: z.array(IngressPortStatusSchema).optional(),
});

export const IngressStatusSchema = z.object({
  loadBalancer: z
    .object({
      ingress: z.array(IngressLoadBalancerIngressSchema).optional(),
    })
    .optional(),
});

export const IngressResourceSchema = z.object({
  apiVersion: z.literal("networking.k8s.io/v1"),
  kind: z.literal("Ingress"),
  metadata: K8sMetadataSchema,
  spec: IngressSpecSchema.optional(),
  status: IngressStatusSchema.optional(),
});

export const IngressListSchema = z.object({
  apiVersion: z.literal("networking.k8s.io/v1"),
  kind: z.literal("IngressList"),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(IngressResourceSchema),
});

// Inferred types for Ingress resources
export type IngressBackend = z.infer<typeof IngressBackendSchema>;
export type IngressPath = z.infer<typeof IngressPathSchema>;
export type IngressRule = z.infer<typeof IngressRuleSchema>;
export type IngressTLS = z.infer<typeof IngressTLSSchema>;
export type IngressSpec = z.infer<typeof IngressSpecSchema>;
export type IngressStatus = z.infer<typeof IngressStatusSchema>;
export type IngressResource = z.infer<typeof IngressResourceSchema>;
export type IngressList = z.infer<typeof IngressListSchema>;
