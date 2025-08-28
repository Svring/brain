"use client";

import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flowgraph/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useRef } from "react";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface BaseNodeProps {
  children: React.ReactNode;
  nodeData: any;
  target?: ResourceTarget;
  className?: string;
}

import _ from "lodash";

export default function BaseNodeWrapper({
  children,
  nodeData,
  target,
  className,
}: BaseNodeProps) {
  const { selectResource } = useProjectActions();
  const { selectedResource } = useProjectState();

  const handleNodeClick = () => {
    if (target) {
      selectResource(target);
    }
  };

  const isSelected =
    selectedResource && target && _.isEqual(selectedResource, target);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode
          className={`${className ?? ""} ${
            isSelected ? "border-theme-blue/50 border" : ""
          }`}
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
