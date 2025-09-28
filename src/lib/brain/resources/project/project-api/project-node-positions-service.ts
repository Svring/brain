"use server";

import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { 
  patchCustomResourceMetadata,
  removeCustomResourceMetadata 
} from "@/lib/k8s/k8s-api/k8s-api-mutation";
import { getCustomResource } from "@/lib/k8s/k8s-api/k8s-api-query";
import { runParallelAction } from "next-server-actions-parallel";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

const NODE_POSITIONS_ANNOTATION_KEY = "brain.sealos.io/node-positions";

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface NodePositionsData {
  version: string;
  positions: NodePosition[];
  timestamp: number;
}

/**
 * Get saved node positions for a project
 */
export async function getProjectNodePositions(
  context: K8sApiContext,
  projectName: string
): Promise<NodePositionsData | null> {
  try {
    const target = convertResourceTypeToTarget("instance", projectName) as CustomResourceTarget;
    const resource = await runParallelAction(getCustomResource(context, target));
    
    const annotations = resource.metadata?.annotations || {};
    const positionsJson = annotations[NODE_POSITIONS_ANNOTATION_KEY];
    
    if (positionsJson) {
      return JSON.parse(positionsJson) as NodePositionsData;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Save node positions for a project
 */
export async function saveProjectNodePositions(
  context: K8sApiContext,
  projectName: string,
  positions: NodePosition[]
): Promise<boolean> {
  try {
    const target = convertResourceTypeToTarget("instance", projectName) as CustomResourceTarget;
    
    const positionsData: NodePositionsData = {
      version: "1.0.0",
      positions,
      timestamp: Date.now(),
    };
    
    await runParallelAction(
      patchCustomResourceMetadata(
        context,
        target,
        "annotations",
        NODE_POSITIONS_ANNOTATION_KEY,
        JSON.stringify(positionsData)
      )
    );
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clear saved node positions for a project
 */
export async function clearProjectNodePositions(
  context: K8sApiContext,
  projectName: string
): Promise<boolean> {
  try {
    const target = convertResourceTypeToTarget("instance", projectName) as CustomResourceTarget;
    
    await runParallelAction(
      removeCustomResourceMetadata(
        context,
        target,
        "annotations",
        NODE_POSITIONS_ANNOTATION_KEY
      )
    );
    
    return true;
  } catch (error) {
    return false;
  }
}