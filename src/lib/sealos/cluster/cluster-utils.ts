"use client";

import { ClusterApiContextSchema } from "./schemas/cluster-api-context-schemas";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth/auth-context";
import { ClusterResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/cluster-schemas";
import { ClusterNodeData } from "./schemas/cluster-node-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import _ from "lodash";

export function createClusterContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return ClusterApiContextSchema.parse({
    baseURL: auth?.regionUrl,
    authorization: auth?.kubeconfig,
  });
}

export function generateClusterName() {
  return `cluster-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}

// Extract name from Kubernetes Cluster resource
export function extractClusterName(cluster: ClusterResource): string {
  return _.get(cluster, "metadata.name");
}

// Extract type from Kubernetes Cluster resource
export function extractClusterType(cluster: ClusterResource): string {
  return _.get(cluster, "spec.clusterDefinitionRef");
}

// Extract version from Kubernetes Cluster resource
export function extractClusterVersion(cluster: ClusterResource): string {
  return _.get(cluster, "spec.clusterVersionRef");
}

// Extract status from Kubernetes Cluster resource
export function extractClusterStatus(cluster: ClusterResource): string {
  return _.get(cluster, "status.phase", "Unknown");
}

// Extract resources from Kubernetes Cluster resource
export function extractClusterResources(cluster: ClusterResource): {
  cpu: string;
  memory: string;
  storage: string;
} {
  const componentSpec = _.get(cluster, "spec.componentSpecs[0]");
  const cpu = _.get(componentSpec, "resources.limits.cpu", "0");
  const memory = _.get(componentSpec, "resources.limits.memory", "0");
  const storage = _.get(
    componentSpec,
    "volumeClaimTemplates[0].spec.resources.requests.storage",
    "0"
  );

  return {
    cpu,
    memory,
    storage,
  };
}

// Extract connection details from Kubernetes Cluster resource
export function extractClusterConnection(cluster: ClusterResource): {
  privateConnection: string;
  publicConnection?: string;
} {
  // For now, return placeholder values as connection details are not directly available in the cluster resource
  // In a real implementation, you would need to query related Service resources
  return {
    privateConnection: "internal-connection-placeholder",
    publicConnection: undefined,
  };
}

// Extract pod information from Kubernetes Pod resources
export function extractClusterPods(pods: K8sResource[]): Array<{
  name: string;
}> {
  return _.map(pods, (pod) => ({
    name: _.get(pod, "metadata.name"),
  }));
}

// Convert Kubernetes Cluster resource to ClusterNodeData
export function convertClusterK8sToNodeData(
  cluster: ClusterResource,
  pods?: K8sResource[]
): Partial<ClusterNodeData> {
  const result: Partial<ClusterNodeData> = {
    name: extractClusterName(cluster),
    type: extractClusterType(cluster),
    version: extractClusterVersion(cluster),
    status: extractClusterStatus(cluster),
    resources: extractClusterResources(cluster),
    // connection: extractClusterConnection(cluster),
    pods: pods ? extractClusterPods(pods) : undefined,
  };

  return result;
}
