import { useMemo } from "react";
import { convertResourceObjectsToNodes } from "@/lib/flowgraph/nodes/flowgraph-nodes-utils";

export default function useFlowgraphNodes(resourceObjects: any[]) {
  const nodes = useMemo(() => {
    return convertResourceObjectsToNodes(resourceObjects);
  }, [resourceObjects]);

  return { nodes };
}
