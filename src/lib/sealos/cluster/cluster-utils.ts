"use client";

import { nanoid } from "nanoid";
import { ClusterResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/cluster-schemas";
import { ClusterNodeData } from "./schemas/cluster-node-schemas";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import _ from "lodash";

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

// Transform componentSpecs to aggregate resources
export function transformComponentSpecsToResources(componentSpecs: any[]): {
  cpu: string;
  memory: string;
  storage: string;
  replicas: number;
} {
  if (!Array.isArray(componentSpecs) || componentSpecs.length === 0) {
    return {
      cpu: "0",
      memory: "0",
      storage: "0",
      replicas: 0,
    };
  }

  let maxCpu = 0;
  let maxMemory = 0;
  let maxStorage = 0;
  let totalReplicas = 0;

  // Helper function to parse CPU values (handles 'm' suffix)
  const parseCpu = (cpu: string): number => {
    if (cpu.endsWith("m")) {
      return parseInt(cpu.slice(0, -1));
    }
    return parseInt(cpu) * 1000; // Convert cores to millicores
  };

  // Helper function to parse memory values (handles Mi, Gi suffixes)
  const parseMemory = (memory: string): number => {
    if (memory.endsWith("Mi")) {
      return parseInt(memory.slice(0, -2));
    }
    if (memory.endsWith("Gi")) {
      return parseInt(memory.slice(0, -2)) * 1024;
    }
    return parseInt(memory);
  };

  // Helper function to parse storage values (handles Gi suffix)
  const parseStorage = (storage: string): number => {
    if (storage.endsWith("Gi")) {
      return parseInt(storage.slice(0, -2));
    }
    return parseInt(storage);
  };

  // Helper function to format CPU back to string
  const formatCpu = (cpu: number): string => {
    if (cpu >= 1000 && cpu % 1000 === 0) {
      return `${cpu / 1000}`;
    }
    return `${cpu}m`;
  };

  // Helper function to format memory back to string
  const formatMemory = (memory: number): string => {
    if (memory >= 1024 && memory % 1024 === 0) {
      return `${memory / 1024}Gi`;
    }
    return `${memory}Mi`;
  };

  // Helper function to format storage back to string
  const formatStorage = (storage: number): string => {
    return `${storage}Gi`;
  };

  componentSpecs.forEach((component: any) => {
    // Sum replicas
    totalReplicas += component.replicas || 0;

    // Find max CPU from limits
    if (component.resources?.limits?.cpu) {
      const cpu = parseCpu(component.resources.limits.cpu);
      maxCpu = Math.max(maxCpu, cpu);
    }

    // Find max memory from limits
    if (component.resources?.limits?.memory) {
      const memory = parseMemory(component.resources.limits.memory);
      maxMemory = Math.max(maxMemory, memory);
    }

    // Find max storage from volumeClaimTemplates
    if (
      component.volumeClaimTemplates &&
      Array.isArray(component.volumeClaimTemplates)
    ) {
      component.volumeClaimTemplates.forEach((template: any) => {
        if (template.spec?.resources?.requests?.storage) {
          const storage = parseStorage(
            template.spec.resources.requests.storage
          );
          maxStorage = Math.max(maxStorage, storage);
        }
      });
    }
  });

  return {
    cpu: formatCpu(maxCpu),
    memory: formatMemory(maxMemory),
    storage: formatStorage(maxStorage),
    replicas: totalReplicas,
  };
}
