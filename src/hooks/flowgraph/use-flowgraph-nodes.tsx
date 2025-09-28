"use client";

import { useMemo, useEffect, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceObjects } from "@/hooks/sealos/resource/use-resource-objects";
import { useProjectNodePositions } from "@/hooks/brain/use-project-node-positions";
import {
  convertObjectsToNodes,
  inferObjectsReliances,
  convertReliancesToEdges,
  deriveNetworkNodesAndEdges,
  applyLayout,
} from "./flowgraph-utils";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import { useFlowgraphActions, useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";

/**
 * Hook to convert resource targets into flowgraph nodes
 * @param targets - Array of resource targets to convert to nodes
 * @returns Object containing nodes, loading state, and error state
 */
export const useFlowgraphNodes = (targets: ResourceTarget[]) => {
  // Fetch resource objects for the given targets
  const resourceObjectsQuery = useResourceObjects(targets);
  const { setSelectedProjectResources } = useProjectActions();
  const { selectedProject } = useProjectState();
  const { setNodes, setEdges, fitView, setHasUserPositions } = useFlowgraphActions();
  
  const {
    savedPositions,
    isLoading: isLoadingPositions,
    applySavedPositions,
    hasSavedPositions,
    savePositions,
    hasCheckedPositions,
  } = useProjectNodePositions(selectedProject || "");

  const hasInitializedNodesRef = useRef(false);
  const hasSetProjectResourcesRef = useRef(false);
  const lastDataLengthRef = useRef(0);
  const lastPositionStateRef = useRef<{ hasPositions: boolean; count: number }>({
    hasPositions: false,
    count: 0
  });

  const { nodes, edges } = useMemo(() => {
    if (resourceObjectsQuery.isLoading || !resourceObjectsQuery.data) {
      return { nodes: [], edges: [] };
    }

    if (!hasCheckedPositions) {
      return { nodes: [], edges: [] };
    }

    const objects = resourceObjectsQuery.data;
    const baseNodes = convertObjectsToNodes(objects);
    const reliances = inferObjectsReliances(objects);
    const baseEdges = convertReliancesToEdges(reliances, objects);
    const { nodes: networkNodes, edges: networkEdges } =
      deriveNetworkNodesAndEdges(objects);
    const mergedNodes = [...baseNodes, ...networkNodes];
    const allEdges = [...(baseEdges || []), ...(networkEdges || [])];

    let finalNodes: Node[];
    
    if (savedPositions && savedPositions.size > 0) {
      finalNodes = applySavedPositions(mergedNodes);
    } else {
      finalNodes = applyLayout(mergedNodes, allEdges);
    }

    return {
      nodes: finalNodes,
      edges: allEdges,
    };
  }, [
    resourceObjectsQuery.data, 
    resourceObjectsQuery.isLoading,
    hasCheckedPositions,
    savedPositions,
    applySavedPositions,
  ]);

  useEffect(() => {
    const currentPositionState = {
      hasPositions: hasSavedPositions,
      count: savedPositions.size
    };
    
    const positionStateChanged = 
      lastPositionStateRef.current.hasPositions !== currentPositionState.hasPositions ||
      lastPositionStateRef.current.count !== currentPositionState.count;

    if (nodes.length > 0 && hasCheckedPositions) {
      if (!hasInitializedNodesRef.current || positionStateChanged) {
        setHasUserPositions(hasSavedPositions);
        setNodes(nodes, hasSavedPositions);
        setEdges(edges);
        hasInitializedNodesRef.current = true;
        lastPositionStateRef.current = currentPositionState;
        
        setTimeout(() => fitView(), 100);
      }
    }
  }, [
    nodes, 
    edges, 
    hasCheckedPositions, 
    hasSavedPositions, 
    savedPositions.size,
    setHasUserPositions, 
    setNodes, 
    setEdges, 
    fitView
  ]);

  useEffect(() => {
    if (resourceObjectsQuery.data) {
      const currentLength = resourceObjectsQuery.data.length;
      if (currentLength !== lastDataLengthRef.current) {
        hasInitializedNodesRef.current = false;
        lastDataLengthRef.current = currentLength;
      }
    }
  }, [resourceObjectsQuery.data?.length]);

  useEffect(() => {
    if (
      resourceObjectsQuery.data && 
      !resourceObjectsQuery.isLoading && 
      !hasSetProjectResourcesRef.current
    ) {
      setSelectedProjectResources(
        resourceObjectsQuery.data.map((object) => ({
          kind: object.kind.toLowerCase(),
          name: object.name,
        }))
      );
      hasSetProjectResourcesRef.current = true;
    }
  }, [
    resourceObjectsQuery.data,
    resourceObjectsQuery.isLoading,
    setSelectedProjectResources
  ]);

  return {
    nodes,
    edges,
    isLoading: resourceObjectsQuery.isLoading || isLoadingPositions || !hasCheckedPositions,
    isPending: resourceObjectsQuery.pending,
    error: resourceObjectsQuery.error,
    resourceObjectsQuery,
    savePositions,
  };
};