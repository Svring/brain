import { z } from "zod";

// API Context schema for k8s queries
export const K8sApiContextSchema = z.object({
  namespace: z.string(),
  kubeconfig: z.string(),
});

export type K8sApiContext = z.infer<typeof K8sApiContextSchema>;

// Re-export all schemas and types from split files

export * from "./request-schemas";
export * from "./resource-schemas/configmap-schemas";
export * from "./resource-schemas/custom-resource-schemas";
export * from "./resource-schemas/daemonset-schemas";
// Re-export builtin resource schemas
export * from "./resource-schemas/deployment-schemas";
export * from "./resource-schemas/ingress-schemas";
export * from "./resource-schemas/instance-schemas";
export * from "./resource-schemas/kubernetes-resource-schemas";
export * from "./resource-schemas/pod-schemas";
export * from "./resource-schemas/pvc-schemas";
export * from "./resource-schemas/resource-target-schemas";
export * from "./resource-schemas/secret-schemas";
export * from "./resource-schemas/service-schemas";
export * from "./resource-schemas/statefulset-schemas";

import {
  ConfigMapListSchema,
  ConfigMapResourceSchema,
} from "./resource-schemas/configmap-schemas";
// Union schemas for all resources
import {
  CustomResourceListSchema,
  CustomResourceSchema,
} from "./resource-schemas/custom-resource-schemas";
import {
  DaemonSetListSchema,
  DaemonSetResourceSchema,
} from "./resource-schemas/daemonset-schemas";
import {
  DeploymentListSchema,
  DeploymentResourceSchema,
} from "./resource-schemas/deployment-schemas";
import {
  IngressListSchema,
  IngressResourceSchema,
} from "./resource-schemas/ingress-schemas";
import {
  InstanceListSchema,
  InstanceResourceSchema,
} from "./resource-schemas/instance-schemas";
import {
  PodListSchema,
  PodResourceSchema,
} from "./resource-schemas/pod-schemas";
import {
  PersistentVolumeClaimListSchema,
  PersistentVolumeClaimResourceSchema,
} from "./resource-schemas/pvc-schemas";
import {
  SecretListSchema,
  SecretResourceSchema,
} from "./resource-schemas/secret-schemas";
import {
  ServiceListSchema,
  ServiceResourceSchema,
} from "./resource-schemas/service-schemas";
import {
  StatefulSetListSchema,
  StatefulSetResourceSchema,
} from "./resource-schemas/statefulset-schemas";

export const AnyKubernetesResourceSchema = z.union([
  CustomResourceSchema,
  InstanceResourceSchema,
  DeploymentResourceSchema,
  ServiceResourceSchema,
  IngressResourceSchema,
  StatefulSetResourceSchema,
  DaemonSetResourceSchema,
  ConfigMapResourceSchema,
  SecretResourceSchema,
  PodResourceSchema,
  PersistentVolumeClaimResourceSchema,
]);

export const AnyKubernetesListSchema = z.union([
  CustomResourceListSchema,
  InstanceListSchema,
  DeploymentListSchema,
  ServiceListSchema,
  IngressListSchema,
  StatefulSetListSchema,
  DaemonSetListSchema,
  ConfigMapListSchema,
  SecretListSchema,
  PodListSchema,
  PersistentVolumeClaimListSchema,
]);

// Inferred types for union schemas
export type AnyKubernetesResource = z.infer<typeof AnyKubernetesResourceSchema>;
export type AnyKubernetesList = z.infer<typeof AnyKubernetesListSchema>;
