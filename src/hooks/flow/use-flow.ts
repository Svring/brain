import {
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useEffect } from "react";
import { inferRelianceFromEnv } from "@/lib/project/project-method/project-utils";
import { convertConnectionsToEdges } from "@/lib/flow/edges/flow-edges-utils";
import { applyLayout } from "@/lib/flow/layout/flow-layout-utils";
import { convertResourcesToNodes } from "@/lib/flow/nodes/flow-nodes-utils";
import type { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import _ from "lodash";

/**
 * Custom hook to process project resources into flow nodes and edges state.
 * @param resources Project resources object (from useProjectResources)
 * @returns [nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange]
 */
export function useFlow(resources: ListAllResourcesResponse | undefined) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!resources) {
      return;
    }

    const resource = _.merge({}, resources.custom, resources.builtin);

    const connections = inferRelianceFromEnv(resource);
    const newNodes = convertResourcesToNodes(resource);
    const newEdges = convertConnectionsToEdges(connections);
    const positionedNodes = applyLayout(newNodes, newEdges, {
      direction: "BT",
    });
    setNodes(positionedNodes);
    setEdges(newEdges);
  }, [resources, setNodes, setEdges]);

  return [nodes, onNodesChange, edges, onEdgesChange] as const;
}
