"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Node } from "@xyflow/react";
import { usePatchResourceMetadataMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { useQuery } from "@tanstack/react-query";
import { getResourceOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { debounce } from "lodash";

const NODE_POSITIONS_ANNOTATION_KEY = "brain.sealos.io/node-positions";

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface NodePositionsData {
  version: string;
  positions: NodePosition[];
  timestamp: number;
}

export function useProjectNodePositions(projectName: string) {
  const k8sContext = createK8sContext();
  const [savedPositions, setSavedPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCheckedPositions, setHasCheckedPositions] = useState(false);
  const [resourceNotFound, setResourceNotFound] = useState(false);
  
  const lastSavedPositionsRef = useRef<string>("");
  const hasLoadedInitialPositionsRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 10; // 最多重试10次
  const retryDelayRef = useRef<NodeJS.Timeout | null>(null);

  const target = convertResourceTypeToTarget("instance", projectName) as CustomResourceTarget;
  
  
  const { 
    data: projectResource, 
    isLoading: isLoadingResource, 
    error: queryError, 
    isError,
    refetch,
    isSuccess 
  } = useQuery({
    ...getResourceOptions(k8sContext, target),
    enabled: !!projectName,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    retry: 3, // React Query 内部重试
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Mutation to save positions to annotation
  const patchMetadataMutation = usePatchResourceMetadataMutation(k8sContext);

  // Load saved positions from annotation
  useEffect(() => {
    if (retryDelayRef.current) {
      clearTimeout(retryDelayRef.current);
      retryDelayRef.current = null;
    }

    if (isLoadingResource) {
      return;
    }

    if (hasLoadedInitialPositionsRef.current && hasCheckedPositions) {
      return;
    }

    if (projectResource && projectResource.metadata) {
      retryCountRef.current = 0;
      setResourceNotFound(false);
      
      try {
        const annotations = projectResource.metadata?.annotations || {};
        const positionsJson = annotations[NODE_POSITIONS_ANNOTATION_KEY];
        
        if (positionsJson) {
          const positionsData: NodePositionsData = JSON.parse(positionsJson);
          const posMap = new Map<string, { x: number; y: number }>();
          
          positionsData.positions.forEach((pos) => {
            posMap.set(pos.id, { x: pos.x, y: pos.y });
          });
          
          setSavedPositions(posMap);
          lastSavedPositionsRef.current = positionsJson;
        }
      } catch (error) {
        // Handle parse error silently
      }
      
      hasLoadedInitialPositionsRef.current = true;
      setHasCheckedPositions(true);
      setIsLoading(false);
    } else {
      if (retryCountRef.current >= maxRetries) {
        setResourceNotFound(true);
        hasLoadedInitialPositionsRef.current = true;
        setHasCheckedPositions(true);
        setIsLoading(false);
      } else {
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * retryCountRef.current, 5000);
        
        setIsLoading(true);
        setHasCheckedPositions(false);
        
        retryDelayRef.current = setTimeout(() => {
          refetch();
        }, retryDelay);
      }
    }

    return () => {
      if (retryDelayRef.current) {
        clearTimeout(retryDelayRef.current);
        retryDelayRef.current = null;
      }
    };
  }, [projectResource, isLoadingResource, isError, isSuccess, queryError, projectName, refetch, hasCheckedPositions]);

  const savePositions = useCallback(
    debounce(async (nodes: Node[]) => {
      if (resourceNotFound) {
        const { data: freshResource } = await refetch();
        if (!freshResource) {
          return;
        }
        setResourceNotFound(false);
      }

      if (!projectName || nodes.length === 0 || isSaving) {
        return;
      }

      const positions: NodePosition[] = nodes.map((node) => ({
        id: node.id,
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      }));

      const positionsData: NodePositionsData = {
        version: "1.0.0",
        positions,
        timestamp: Date.now(),
      };

      const newPositionsJson = JSON.stringify(positionsData);
      
      if (newPositionsJson === lastSavedPositionsRef.current) {
        return;
      }

      setIsSaving(true);
      try {
        await patchMetadataMutation.mutateAsync({
          target,
          metadataType: "annotations",
          key: NODE_POSITIONS_ANNOTATION_KEY,
          value: newPositionsJson,
        });

        const posMap = new Map<string, { x: number; y: number }>();
        positions.forEach((pos) => {
          posMap.set(pos.id, { x: pos.x, y: pos.y });
        });
        setSavedPositions(posMap);
        lastSavedPositionsRef.current = newPositionsJson;
        
        if (resourceNotFound) {
          setResourceNotFound(false);
        }
      } catch (error) {
        const err = error as { message?: string };
        if (err.message?.includes("not found") || err.message?.includes("404")) {
          setResourceNotFound(true);
        }
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [projectName, target, patchMetadataMutation, isSaving, resourceNotFound, refetch]
  );

  // Apply saved positions to nodes
  const applySavedPositions = useCallback(
    (nodes: Node[]): Node[] => {
      if (savedPositions.size === 0) {
        return nodes;
      }

      const updatedNodes = nodes.map((node) => {
        const savedPos = savedPositions.get(node.id);
        if (savedPos && (node.position.x !== savedPos.x || node.position.y !== savedPos.y)) {
          return {
            ...node,
            position: savedPos,
          };
        }
        return node;
      });

      return updatedNodes;
    },
    [savedPositions]
  );

  // Check if we have saved positions
  const hasSavedPositions = savedPositions.size > 0;

  // Clear saved positions
  const clearPositions = useCallback(async () => {
    try {
      await patchMetadataMutation.mutateAsync({
        target,
        metadataType: "annotations",
        key: NODE_POSITIONS_ANNOTATION_KEY,
        value: "",
      });
      setSavedPositions(new Map());
      lastSavedPositionsRef.current = "";
    } catch (error) {
      // Handle error silently
    }
  }, [target, patchMetadataMutation]);

  return {
    savedPositions,
    isLoading: isLoading || isLoadingResource,
    isSaving,
    savePositions,
    applySavedPositions,
    hasSavedPositions,
    clearPositions,
    hasCheckedPositions,
    resourceNotFound,
  };
}