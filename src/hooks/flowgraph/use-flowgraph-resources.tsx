import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import _ from "lodash";

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

  // console.log("nodes", nodes);

  // Extract resources from nodes using lodash
  const selectedProjectResources = _.chain(nodes)
    .map("data")
    .filter(
      (data: any) => data && !data.label && (data.resourceType || data.target)
    )
    .flatMap((data: any) => {
      const resources: FlowgraphResource[] = [];

      // Handle direct resource nodes
      if (data.resourceType && data.name) {
        resources.push({
          name: data.name as string,
          kind: data.resourceType as string,
          resourceType: data.resourceType as string,
        });
      }

      // Handle network nodes with targets
      if (data.target?.resourceType && data.target?.name) {
        resources.push({
          name: data.target.name as string,
          kind: data.target.resourceType as string,
          resourceType: data.target.resourceType as string,
        });
      }

      return resources;
    })
    .value();

  // Categorize resources using lodash
  const clusterResources = _.filter(
    selectedProjectResources,
    (resource) => _.toLower(resource.kind) === "cluster"
  );

  // console.log("clusterResources", clusterResources);

  const launchpadResources = _.filter(selectedProjectResources, (resource) =>
    _.includes(["deployment", "statefulset"], _.toLower(resource.kind))
  );

  const devboxResources = _.filter(
    selectedProjectResources,
    (resource) => _.toLower(resource.kind) === "devbox"
  );

  const objectStorageBucketResources = _.filter(
    selectedProjectResources,
    (resource) => _.toLower(resource.kind) === "objectstoragebucket"
  );

  return {
    clusterResources,
    launchpadResources,
    devboxResources,
    objectStorageBucketResources,
    allResources: selectedProjectResources,
  };
}
