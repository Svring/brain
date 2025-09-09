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
      ? devbox.networkStatus.queryOptions({
          devboxName: resource?.name || target.name || "",
        })
      : launchpad.checkLaunchpadReady.queryOptions({
          launchpadName: resource?.name || target.name || "",
        })),
    enabled: !!(resource?.name || target.name),
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
    if (statusKey !== "allNotReady") return;

    const desiredStroke = "#9F833B";
    const desiredMarker = {
      type: MarkerType.Arrow,
      width: 30,
      height: 30,
      color: desiredStroke,
    };

    connectedEdges.forEach((edge) => {
      const currentStroke = edge.style?.stroke;
      const currentType = edge.type;
      const currentMarkerColor = (edge.markerEnd as any)?.color;

      if (
        currentStroke !== desiredStroke ||
        currentType !== "floating" ||
        currentMarkerColor !== desiredStroke
      ) {
        updateEdge({
          ...edge,
          style: { ...edge.style, stroke: desiredStroke },
          markerEnd: desiredMarker,
          type: "floating",
        });
      }
    });
  }, [statusKey, connectedEdges]);

  return { readyStatus, getBackgroundColor };
};
