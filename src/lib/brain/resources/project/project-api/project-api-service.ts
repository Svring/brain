import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { getClusterLogs } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { getLaunchpadLogs } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import _ from "lodash";

export interface ProjectResource {
  name: string;
  kind: string;
}

export interface ProjectLogEntry {
  name: string;
  kind: string;
  logs: any;
}

export interface GetAllLogsRequest {
  clusterResources: ProjectResource[];
  launchpadResources: ProjectResource[];
}

export interface GetAllLogsResponse {
  logs: ProjectLogEntry[];
}

/**
 * Get all logs for project resources (clusters and launchpads)
 */
export async function getAllProjectLogs(
  k8sContext: K8sApiContext,
  sealosContext: SealosApiContext,
  request: GetAllLogsRequest
): Promise<GetAllLogsResponse> {
  const allLogs: ProjectLogEntry[] = [];

  // Get cluster logs
  for (const clusterResource of request.clusterResources) {
    try {
      const target = convertResourceTypeToTarget(
        "cluster",
        clusterResource.name
      ) as CustomResourceTarget;
      const clusterLogs = await getClusterLogs(
        k8sContext,
        sealosContext,
        target
      );
      allLogs.push({
        name: clusterResource.name,
        kind: clusterResource.kind,
        logs: clusterLogs,
      });
    } catch (error) {
      console.error(
        `Failed to get logs for cluster ${clusterResource.name}:`,
        error
      );
      allLogs.push({
        name: clusterResource.name,
        kind: clusterResource.kind,
        logs: {
          error: `Failed to fetch logs: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      });
    }
  }

  // Get launchpad logs
  for (const launchpadResource of request.launchpadResources) {
    try {
      // Try to determine the actual resource type from the node data
      const resourceType =
        (launchpadResource as any).resourceType || "deployment";
      const target = convertResourceTypeToTarget(
        resourceType,
        launchpadResource.name
      ) as BuiltinResourceTarget;
      const launchpadLogs = await getLaunchpadLogs(
        k8sContext,
        sealosContext,
        target
      );
      allLogs.push({
        name: launchpadResource.name,
        kind: launchpadResource.kind,
        logs: launchpadLogs,
      });
    } catch (error) {
      console.error(
        `Failed to get logs for launchpad ${launchpadResource.name}:`,
        error
      );
      allLogs.push({
        name: launchpadResource.name,
        kind: launchpadResource.kind,
        logs: {
          error: `Failed to fetch logs: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      });
    }
  }

  return { logs: allLogs };
}
