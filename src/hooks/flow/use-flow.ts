import {
  type Edge,
  type Node,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { useEffect, useCallback } from "react";
import { inferRelianceFromEnv } from "@/lib/algorithm/reliance/env-reliance";
import { inferRelianceForIngress } from "@/lib/algorithm/reliance/ingress-reliance";
import {
  convertReliancesToEdges,
  updateEdgesForNode,
} from "@/lib/flow/edges/flow-edges-utils";
import { applyLayout } from "@/lib/flow/layout/flow-layout-utils";
import { convertResourcesToNodes } from "@/lib/flow/nodes/flow-nodes-utils";
import type { ListAllResourcesResponse } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";
import { createTrafficApiContext } from "@/lib/service/traffic/traffic-utils";
import { useFlowState, useFlowActions } from "@/contexts/flow/flow-context";
import { useProjectResources } from "@/hooks/project/use-project-resources";
import _ from "lodash";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { inferRelianceFromTraffic } from "@/lib/algorithm/reliance/traffic-reliance";

/**
 * Custom hook to process project resources into flow nodes and edges state.
 * @param projectName The name of the project
 * @returns [nodes, onNodesChange, edges, onEdgesChange, isLoading]
 */
export function useFlow(context: K8sApiContext, projectName: string) {
  const { nodes, edges } = useFlowState();
  const { setFlowData, updateNodes, updateEdges } = useFlowActions();
  const { data: resources, isLoading } = useProjectResources(
    context,
    projectName
  );

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

  const trafficApiContext = createTrafficApiContext();

  useEffect(() => {
    if (!resources) {
      return;
    }

    const resource = _.merge({}, resources.custom, resources.builtin);
    const envReliances = inferRelianceFromEnv(resource);
    console.log("envConnections", envReliances);
    const ingressReliances = inferRelianceForIngress(resource);
    const reliances = _.merge({}, envReliances, ingressReliances);
    const newNodes = convertResourcesToNodes(resource);
    const newEdges = convertReliancesToEdges(reliances);
    const positionedNodes = applyLayout(newNodes, newEdges, {
      direction: "BT",
    });

    const inferTraffic = async () => {
      const reliance = await inferRelianceFromTraffic(
        trafficApiContext,
        resource
      );
    };

    inferTraffic();
    setFlowData(positionedNodes, newEdges);
  }, [resources]);

  return [nodes, onNodesChange, edges, onEdgesChange, isLoading] as const;
}
