import {
  type Edge,
  type Node,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { useEffect, useCallback } from "react";
import { inferRelianceFromEnv } from "@/lib/project/project-method/project-utils";
import { inferRelianceForIngress } from "@/lib/algorithm/reliance/ingress-reliance";
import {
  convertConnectionsToEdges,
  updateEdgesForNode,
} from "@/lib/flow/edges/flow-edges-utils";
import { applyLayout } from "@/lib/flow/layout/flow-layout-utils";
import { convertResourcesToNodes } from "@/lib/flow/nodes/flow-nodes-utils";
import type { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { useFlowState, useFlowActions } from "@/contexts/flow/flow-context";
import _ from "lodash";

/**
 * Custom hook to process project resources into flow nodes and edges state.
 * @param resources Project resources object (from useProjectResources)
 * @returns [nodes, onNodesChange, edges, onEdgesChange]
 */
export function useFlow(resources: ListAllResourcesResponse | undefined) {
  const { nodes, edges } = useFlowState();
  const { setFlowData, updateNodes, updateEdges } = useFlowActions();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      updateNodes(updatedNodes);
    },
    [nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      updateEdges(updatedEdges);
    },
    [edges]
  );

  useEffect(() => {
    if (!resources) {
      return;
    }

    const resource = _.merge({}, resources.custom, resources.builtin);
    const envConnections = inferRelianceFromEnv(resource);
    const ingressConnections = inferRelianceForIngress(resource);
    const connections = _.merge({}, envConnections, ingressConnections);
    const newNodes = convertResourcesToNodes(resource);
    const newEdges = convertConnectionsToEdges(connections);
    const positionedNodes = applyLayout(newNodes, newEdges, {
      direction: "BT",
    });
    setFlowData(positionedNodes, newEdges);
  }, [resources]);

  return [nodes, onNodesChange, edges, onEdgesChange] as const;
}
