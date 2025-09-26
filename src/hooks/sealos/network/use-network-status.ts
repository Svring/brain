import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { MarkerType } from "@xyflow/react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const useNetworkStatus = (target: ResourceTarget) => {
  const { devbox, launchpad } = useTRPCClients();
  const { edges } = useFlowgraphState();
  const { updateEdge } = useFlowgraphActions();
  const { resource } = useResourceStatus(target);

  const networkNodeId = `network-${resource?.name || target.name}`;
  const connectedEdges = useMemo(
    () =>
      edges.filter(
        (edge) => edge.target === networkNodeId || edge.source === networkNodeId
      ),
    [edges, networkNodeId]
  );

  const isDevbox = target.type === "custom" && target.resourceType === "devbox";
  const { data: readyStatus } = useQuery({
    ...(isDevbox
      ? devbox.networkStatus.queryOptions(resource?.name)
      : launchpad.networkStatus.queryOptions(resource?.name)),
    enabled: !!(resource?.name || target.name),
    refetchInterval: 3000,
  });

  const statusKey = useMemo(() => {
    if (!Array.isArray(readyStatus) || !readyStatus.length) return "unknown";
    const readyCount = readyStatus.filter((item: any) => item.ready).length;
    if (readyCount === 0) return "allNotReady";
    if (readyCount === readyStatus.length) return "allReady";
    return "partial";
  }, [readyStatus]);

  const getBackgroundColor = () =>
    statusKey === "allNotReady" || statusKey === "partial"
      ? "bg-status-warning"
      : "";

  useEffect(() => {
    const desiredStroke = "#9F833B";
    const desiredMarker = {
      type: MarkerType.Arrow,
      width: 30,
      height: 30,
      color: desiredStroke,
    };

    connectedEdges.forEach((edge) => {
      const currentType = edge.type;

      if (statusKey === "allNotReady" || statusKey === "partial") {
        // Use error edge type for not ready or partial status
        if (currentType !== "floatingError") {
          updateEdge({
            ...edge,
            type: "floatingError",
            markerEnd: desiredMarker,
          });
        }
      } else {
        // Use normal floating edge for ready status
        if (currentType !== "floating") {
          updateEdge({
            ...edge,
            type: "floating",
            markerEnd: undefined,
          });
        }
      }
    });
  }, [statusKey, connectedEdges]);

  return { readyStatus, getBackgroundColor };
};
