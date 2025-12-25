"use client";

import { Handle, Position } from "@xyflow/react";
import _ from "lodash";
import { toast } from "sonner";
import { BaseNode } from "@/components/flowgraph/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useNavigationActions } from "@/contexts/navigation/navigation-context";
import type { ResourceView } from "@/contexts/navigation/navigation-machine";
import { useProjectState } from "@/contexts/project/project-context";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useResourceDelete } from "@/hooks/sealos/resource/use-resource-delete";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface BaseNodeProps {
  children: React.ReactNode;
  nodeId: any;
  target: ResourceTarget;
  className?: string;
  messageType?: string;
  width?: "auto" | "fixed";
  view?: ResourceView;
  disableClick?: boolean;
}

export default function BaseNodeWrapper({
  children,
  nodeId,
  target,
  className,
  messageType,
  width = "fixed",
  view,
  disableClick = false,
}: BaseNodeProps) {
  const { selectedResource } = useProjectState();
  const { changeView } = useNavigationActions();

  // Use the new hook for node selection
  const { handleNodeSelect } = useNodeSelect({
    target: target,
  });

  // Get resource metrics status and delete status (only when target exists)
  const { status: metricsStatus } = target
    ? useResourceMetricsStatus({
        target,
      })
    : { status: undefined };
  const { isPending: isDeleting } = target
    ? useResourceDelete(target)
    : { isPending: false };

  const isSelected =
    selectedResource && target && _.isEqual(selectedResource, target);

  // Custom node click handler
  const handleNodeClick = async () => {
    if (disableClick) {
      toast.info("This node is view-only and cannot be interacted with", {
        description:
          "Some resources are read-only and don't support detailed views or interactions.",
      });
      return;
    }

    await handleNodeSelect();

    // Set the view in navigation machine if view is provided
    if (view) {
      changeView(view);
    }
  };

  // Determine the appropriate styling based on status
  const getNodeStyling = () => {
    let baseStyles = "";

    // Add width classes based on width prop
    if (width === "auto") {
      baseStyles += " w-auto min-w-70 max-w-96";
    }

    // If resource is being deleted or has high metrics status, show deleting styles
    if (target && (isDeleting || metricsStatus === "high")) {
      return baseStyles + " bg-status-deleting/50 border-border-deleting";
    }

    // If resource is selected, show blue border and elevate above overlay
    if (isSelected) {
      return baseStyles + " border-theme-blue/50 border relative z-20";
    }

    // Default styling
    return baseStyles;
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode
          className={`${className ?? ""} ${getNodeStyling()}`}
          onClick={handleNodeClick}
          data-view={view}
        >
          <Handle position={Position.Top} type="source" />
          {children}
          <Handle position={Position.Bottom} type="target" />
        </BaseNode>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
