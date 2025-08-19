import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { devboxClient } from "@/components/provider/trpc-provider";
import { launchpadClient } from "@/components/provider/trpc-provider";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { MarkerType } from "@xyflow/react";

interface UseNetworkStatusProps {
  parent: any;
}

export const useNetworkStatus = ({ parent }: UseNetworkStatusProps) => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();
  const { edges } = useFlowgraphState();
  const { updateEdge } = useFlowgraphActions();

  // Memoize the network node ID to prevent unnecessary recalculations
  const networkNodeId = useMemo(
    () => `network-${parent?.name}`,
    [parent?.name]
  );

  // Memoize connected edges to prevent infinite re-renders when edges array identity changes
  const connectedEdges = useMemo(() => {
    return edges.filter(
      (edge) => edge.target === networkNodeId || edge.source === networkNodeId
    );
  }, [edges, networkNodeId]);

  // Determine which ready check to call based on parent kind
  const isDevbox = parent?.kind?.toLowerCase() === "devbox";

  // Call the appropriate ready check
  const { data: readyStatus } = useQuery({
    ...(isDevbox
      ? devboxTrpcClient.checkDevboxReady.queryOptions({
          devboxName: parent?.name || "",
        })
      : launchpadTrpcClient.checkLaunchpadReady.queryOptions({
          launchpadName: parent?.name || "",
        })),
    enabled: !!parent?.name,
  });

  // Derive a stable status key from response for effect dependency
  const statusKey = useMemo(() => {
    const statusData = readyStatus as any;
    if (!statusData?.data || !Array.isArray(statusData.data)) return "unknown";
    const total = statusData.data.length;
    const readyCount = statusData.data.filter((item: any) => item.ready).length;
    if (readyCount === 0) return "allNotReady";
    if (readyCount === total) return "allReady";
    return "partial";
  }, [readyStatus]);

  // Determine background color based on status key
  const getBackgroundColor = () => {
    if (statusKey === "allNotReady") return "bg-status-error/20";
    if (statusKey === "partial") return "bg-theme-yellow/20";
    return "";
  };

  // Update edge color based on network status.
  // - Only runs when statusKey or node id changes
  // - Only updates edges when their props actually differ
  useEffect(() => {
    if (statusKey === "unknown") return;

    const desiredStroke = statusKey === "allNotReady" ? "#ef4444" : "#3b82f6";
    const desiredType = "floating" as const;
    const desiredMarker = {
      type: MarkerType.Arrow as const,
      width: 30,
      height: 30,
      color: desiredStroke,
    };

    connectedEdges.forEach((edge) => {
      const currentStroke = edge.style?.stroke as string | undefined;
      const currentType = edge.type;
      const currentMarkerColor = (edge.markerEnd as any)?.color as
        | string
        | undefined;

      const needsUpdate =
        currentStroke !== desiredStroke ||
        currentType !== desiredType ||
        currentMarkerColor !== desiredStroke;

      if (!needsUpdate) return;

      updateEdge({
        ...edge,
        style: {
          ...edge.style,
          stroke: desiredStroke,
        },
        markerEnd: desiredMarker,
        type: desiredType,
      });
    });
  }, [statusKey, networkNodeId, connectedEdges]);

  return {
    readyStatus,
    getBackgroundColor,
  };
};
