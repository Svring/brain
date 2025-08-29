import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";

export interface FlowgraphResource {
  name: string;
  kind: string;
  resourceType?: string;
}

export interface FlowgraphResources {
  clusterResources: FlowgraphResource[];
  launchpadResources: FlowgraphResource[];
  devboxResources: FlowgraphResource[];
  objectStorageBucketResources: FlowgraphResource[];
  allResources: FlowgraphResource[];
}

/**
 * Hook to extract and categorize resources from flowgraph nodes
 * Supports cluster, launchpad (deployment/statefulset), devbox, and objectstoragebucket resources
 */
export function useFlowgraphResources(): FlowgraphResources {
  const { nodes } = useFlowgraphState();
  
  const selectedProjectResources = nodes
    .map((node) => node.data)
    .filter((resource) => resource.kind)
    .map((resource) => ({
      name: resource.name as string,
      kind: resource.kind as string,
      resourceType: (resource as any).resourceType,
    }));

  const clusterResources = selectedProjectResources.filter(
    (resource) => resource.kind.toLowerCase() === "cluster"
  );

  const launchpadResources = selectedProjectResources.filter(
    (resource) =>
      resource.kind.toLowerCase() === "deployment" ||
      resource.kind.toLowerCase() === "statefulset"
  );

  const devboxResources = selectedProjectResources.filter(
    (resource) => resource.kind.toLowerCase() === "devbox"
  );

  const objectStorageBucketResources = selectedProjectResources.filter(
    (resource) => resource.kind.toLowerCase() === "objectstoragebucket"
  );

  return {
    clusterResources,
    launchpadResources,
    devboxResources,
    objectStorageBucketResources,
    allResources: selectedProjectResources,
  };
}
