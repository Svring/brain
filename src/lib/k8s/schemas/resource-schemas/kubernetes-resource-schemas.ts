import { z } from "zod";

// Kubernetes resource schemas
export const KubernetesMetadataSchema = z.object({
  name: z.string(),
  namespace: z.string().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.string()).optional(),
  uid: z.string().optional(),
  resourceVersion: z.string().optional(),
  generation: z.number().optional(),
  creationTimestamp: z.string().optional(),
  deletionTimestamp: z.string().optional(),
  finalizers: z.array(z.string()).optional(),
  ownerReferences: z
    .array(
      z.object({
        apiVersion: z.string(),
        kind: z.string(),
        name: z.string(),
        uid: z.string(),
        controller: z.boolean().optional(),
        blockOwnerDeletion: z.boolean().optional(),
      })
    )
    .optional(),
});

export const KubernetesResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: KubernetesMetadataSchema,
  spec: z.record(z.unknown()).optional(),
  status: z.record(z.unknown()).optional(),
});

export const KubernetesListSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      resourceVersion: z.string().optional(),
      continue: z.string().optional(),
      remainingItemCount: z.number().optional(),
    })
    .optional(),
  items: z.array(KubernetesResourceSchema),
});

// Common schemas used across multiple resources
export const ContainerPortSchema = z.object({
  name: z.string().optional(),
  containerPort: z.number(),
  protocol: z.enum(["TCP", "UDP", "SCTP"]).optional(),
  hostIP: z.string().optional(),
  hostPort: z.number().optional(),
});

export const EnvVarSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
  valueFrom: z
    .object({
      fieldRef: z
        .object({
          apiVersion: z.string().optional(),
          fieldPath: z.string(),
        })
        .optional(),
      resourceFieldRef: z
        .object({
          containerName: z.string().optional(),
          resource: z.string(),
          divisor: z.string().optional(),
        })
        .optional(),
      configMapKeyRef: z
        .object({
          name: z.string().optional(),
          key: z.string(),
          optional: z.boolean().optional(),
        })
        .optional(),
      secretKeyRef: z
        .object({
          name: z.string().optional(),
          key: z.string(),
          optional: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const VolumeMountSchema = z.object({
  name: z.string(),
  mountPath: z.string(),
  subPath: z.string().optional(),
  readOnly: z.boolean().optional(),
  mountPropagation: z.string().optional(),
  subPathExpr: z.string().optional(),
});

export const ResourceRequirementsSchema = z.object({
  limits: z.record(z.string()).optional(),
  requests: z.record(z.string()).optional(),
});

export const ContainerSchema = z.object({
  name: z.string(),
  image: z.string(),
  command: z.array(z.string()).optional(),
  args: z.array(z.string()).optional(),
  workingDir: z.string().optional(),
  ports: z.array(ContainerPortSchema).optional(),
  env: z.array(EnvVarSchema).optional(),
  resources: ResourceRequirementsSchema.optional(),
  volumeMounts: z.array(VolumeMountSchema).optional(),
  livenessProbe: z.record(z.unknown()).optional(),
  readinessProbe: z.record(z.unknown()).optional(),
  startupProbe: z.record(z.unknown()).optional(),
  lifecycle: z.record(z.unknown()).optional(),
  terminationMessagePath: z.string().optional(),
  terminationMessagePolicy: z.string().optional(),
  imagePullPolicy: z.enum(["Always", "Never", "IfNotPresent"]).optional(),
  securityContext: z.record(z.unknown()).optional(),
  stdin: z.boolean().optional(),
  stdinOnce: z.boolean().optional(),
  tty: z.boolean().optional(),
});

export const VolumeSchema = z.object({
  name: z.string(),
  hostPath: z
    .object({
      path: z.string(),
      type: z.string().optional(),
    })
    .optional(),
  emptyDir: z
    .object({
      medium: z.string().optional(),
      sizeLimit: z.string().optional(),
    })
    .optional(),
  configMap: z
    .object({
      name: z.string().optional(),
      items: z
        .array(
          z.object({
            key: z.string(),
            path: z.string(),
            mode: z.number().optional(),
          })
        )
        .optional(),
      defaultMode: z.number().optional(),
      optional: z.boolean().optional(),
    })
    .optional(),
  secret: z
    .object({
      secretName: z.string().optional(),
      items: z
        .array(
          z.object({
            key: z.string(),
            path: z.string(),
            mode: z.number().optional(),
          })
        )
        .optional(),
      defaultMode: z.number().optional(),
      optional: z.boolean().optional(),
    })
    .optional(),
  persistentVolumeClaim: z
    .object({
      claimName: z.string(),
      readOnly: z.boolean().optional(),
    })
    .optional(),
  nfs: z
    .object({
      server: z.string(),
      path: z.string(),
      readOnly: z.boolean().optional(),
    })
    .optional(),
  // Add other volume types as needed
});

export const PodSpecSchema = z.object({
  containers: z.array(ContainerSchema),
  initContainers: z.array(ContainerSchema).optional(),
  restartPolicy: z.enum(["Always", "OnFailure", "Never"]).optional(),
  terminationGracePeriodSeconds: z.number().optional(),
  activeDeadlineSeconds: z.number().optional(),
  dnsPolicy: z.string().optional(),
  nodeSelector: z.record(z.string()).optional(),
  serviceAccountName: z.string().optional(),
  serviceAccount: z.string().optional(),
  automountServiceAccountToken: z.boolean().optional(),
  nodeName: z.string().optional(),
  hostNetwork: z.boolean().optional(),
  hostPID: z.boolean().optional(),
  hostIPC: z.boolean().optional(),
  shareProcessNamespace: z.boolean().optional(),
  securityContext: z.record(z.unknown()).optional(),
  imagePullSecrets: z
    .array(
      z.object({
        name: z.string().optional(),
      })
    )
    .optional(),
  hostname: z.string().optional(),
  subdomain: z.string().optional(),
  affinity: z.record(z.unknown()).optional(),
  schedulerName: z.string().optional(),
  tolerations: z.array(z.record(z.unknown())).optional(),
  hostAliases: z.array(z.record(z.unknown())).optional(),
  priorityClassName: z.string().optional(),
  priority: z.number().optional(),
  dnsConfig: z.record(z.unknown()).optional(),
  readinessGates: z.array(z.record(z.unknown())).optional(),
  runtimeClassName: z.string().optional(),
  enableServiceLinks: z.boolean().optional(),
  preemptionPolicy: z.string().optional(),
  overhead: z.record(z.string()).optional(),
  topologySpreadConstraints: z.array(z.record(z.unknown())).optional(),
  volumes: z.array(VolumeSchema).optional(),
});

// Inferred types for Kubernetes resources
export type KubernetesMetadata = z.infer<typeof KubernetesMetadataSchema>;
export type KubernetesResource = z.infer<typeof KubernetesResourceSchema>;
export type KubernetesList = z.infer<typeof KubernetesListSchema>;
export type Container = z.infer<typeof ContainerSchema>;
export type PodSpec = z.infer<typeof PodSpecSchema>;
export type Volume = z.infer<typeof VolumeSchema>;
export type ContainerPort = z.infer<typeof ContainerPortSchema>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
export type VolumeMount = z.infer<typeof VolumeMountSchema>;
export type ResourceRequirements = z.infer<typeof ResourceRequirementsSchema>;
