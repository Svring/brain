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

  // Use resource status hook to get the resource data
  const { resource } = useResourceStatus(target);

  // Memoize the network node ID to prevent unnecessary recalculations
  const networkNodeId = useMemo(
    () => `network-${resource?.name || target.name}`,
    [resource?.name, target.name]
  );

  // Memoize connected edges to prevent infinite re-renders when edges array identity changes
  const connectedEdges = useMemo(() => {
    return edges.filter(
      (edge) => edge.target === networkNodeId || edge.source === networkNodeId
    );
  }, [edges, networkNodeId]);

  // Determine which ready check to call based on target type and resource kind
  const isDevbox = target.type === "custom" && target.resourceType === "devbox";

  // Call the appropriate ready check
  const { data: readyStatus } = useQuery({
    ...(isDevbox
      ? devbox.checkDevboxReady.queryOptions({
          devboxName: resource?.name || target.name || "",
        })
      : launchpad.checkLaunchpadReady.queryOptions({
          launchpadName: resource?.name || target.name || "",
        })),
    enabled: !!(resource?.name || target.name),
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
    if (statusKey === "allNotReady") return "bg-status-warning";
    if (statusKey === "partial") return "bg-status-warning";
    return "";
  };

  // Update edge color based on network status.
  // - Only runs when statusKey or node id changes
  // - Only updates edges when their props actually differ
  useEffect(() => {
    if (statusKey === "unknown") return;

    // Only change color to red if status is not ready
    // Otherwise, keep the original stroke color
    const shouldChangeToYellow = statusKey === "allNotReady";
    const desiredType = "floating" as const;

    connectedEdges.forEach((edge) => {
      const currentStroke = edge.style?.stroke as string | undefined;
      const currentType = edge.type;
      const currentMarkerColor = (edge.markerEnd as any)?.color as
        | string
        | undefined;

      // Only update if we need to change to red (error state)
      if (shouldChangeToYellow) {
        const desiredStroke = "#9F833B"; // Yellow for error state
        const desiredMarker = {
          type: MarkerType.Arrow as const,
          width: 30,
          height: 30,
          color: desiredStroke,
        };

        const needsUpdate =
          currentStroke !== desiredStroke ||
          currentType !== desiredType ||
          currentMarkerColor !== desiredStroke;

        if (needsUpdate) {
          updateEdge({
            ...edge,
            style: {
              ...edge.style,
              stroke: desiredStroke,
            },
            markerEnd: desiredMarker,
            type: desiredType,
          });
        }
      }
      // If status is normal, don't update the edge at all - keep original colors
    });
  }, [statusKey, networkNodeId, connectedEdges]);

  return {
    readyStatus,
    getBackgroundColor,
  };
};
