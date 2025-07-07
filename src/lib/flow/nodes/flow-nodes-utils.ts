import type { Node } from "@xyflow/react";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";

import { convertResourceToNode as convertClusterResourceToNode } from "./cluster/flow-cluster-utils";
import { convertResourceToNode as convertDeploymentResourceToNode } from "./deployment/flow-deployment-utils";
import { convertResourceToNode as convertIngressResourceToNode } from "./ingress/flow-ingress-utils";
import { convertResourceToNode as convertObjectStorageBucketResourceToNode } from "./objectstoragebucket/flow-objectstoragebucket-utils";
import { convertResourceToNode as convertStatefulSetResourceToNode } from "./statefulset/flow-statefulset-utils";

type NodeData = Record<string, unknown>;
type ConverterFn = (resource: AnyKubernetesResource) => NodeData;

// Mapping of resource keys to their conversion functions and node types
const CONVERTERS: Record<string, { nodeType: string; convert: ConverterFn }> = {
  cluster: {
    nodeType: "cluster",
    convert: convertClusterResourceToNode as unknown as ConverterFn,
  },
  ingress: {
    nodeType: "ingress",
    convert: convertIngressResourceToNode as unknown as ConverterFn,
  },
  deployment: {
    nodeType: "deployment",
    convert: convertDeploymentResourceToNode as unknown as ConverterFn,
  },
  statefulset: {
    nodeType: "statefulset",
    convert: convertStatefulSetResourceToNode as unknown as ConverterFn,
  },
  objectstoragebucket: {
    nodeType: "objectstoragebucket",
    convert: convertObjectStorageBucketResourceToNode as unknown as ConverterFn,
  },
};

/**
 * Convert Kubernetes resources grouped by kind into React Flow nodes.
 *
 * @param resources Record keyed by kind (lowercase string) with `{ items: AnyKubernetesResource[] }`.
 * @returns Array of nodes compatible with React Flow.
 */
export const convertResourcesToNodes = (
  resources: Record<string, { items: AnyKubernetesResource[] }>
): Node<NodeData>[] => {
  const nodes: Node<NodeData>[] = [];

  for (const [kind, { items }] of Object.entries(resources)) {
    const mapping = CONVERTERS[kind];
    if (!(mapping && items) || items.length === 0) {
      continue;
    }

    for (const resource of items) {
      const name = (resource as AnyKubernetesResource).metadata.name;
      if (!name) {
        continue;
      }

      const id = `${kind}-${name}`;
      const data = mapping.convert(resource);

      nodes.push({
        id,
        type: mapping.nodeType,
        position: { x: 0, y: 0 },
        data,
      });
    }
  }

  return nodes;
};
