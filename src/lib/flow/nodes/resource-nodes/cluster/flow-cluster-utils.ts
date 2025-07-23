import type { ClusterResource } from "@/lib/k8s/schemas/resource-schemas/cluster-schemas";
import { convertToResourceTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { CLUSTER_DEFINITION_LABEL_KEY } from "@/lib/sealos/cluster/cluster-constant";

// Converts a ClusterResource to node data for DatabaseNode
export function convertResourceToNode(resource: ClusterResource) {
  return {
    target: convertToResourceTarget(resource, CUSTOM_RESOURCES.cluster),
  };
}
