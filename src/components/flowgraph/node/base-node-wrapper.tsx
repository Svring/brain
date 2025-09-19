"use client";

import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flowgraph/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useProjectState } from "@/contexts/project/project-context";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useResourceDelete } from "@/hooks/sealos/resource/use-resource-delete";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useStreamContext } from "@/components/provider/stream-provider";
import { useThreads } from "@/components/provider/thread-provider";
import _ from "lodash";

interface BaseNodeProps {
  children: React.ReactNode;
  nodeId: any;
  target: ResourceTarget;
  className?: string;
  messageType?: string;
  width?: "auto" | "fixed";
}

export default function BaseNodeWrapper({
  children,
  nodeId,
  target,
  className,
  messageType,
  width = "fixed",
}: BaseNodeProps) {
  const { selectedResource } = useProjectState();
  const { submitWithContext } = useStreamContext();

  // Use the new hook for node selection
  const { handleNodeSelect } = useNodeSelect({
    target: target,
    messageType,
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
    await handleNodeSelect();
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
        >
          <Handle position={Position.Top} type="source" />
          {children}
          <Handle position={Position.Bottom} type="target" />
        </BaseNode>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
