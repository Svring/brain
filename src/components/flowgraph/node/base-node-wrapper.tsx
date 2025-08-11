"use client";

import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flowgraph/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useRef, useState } from "react";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useFlowgraphState, useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";

interface BaseNodeProps {
  children: React.ReactNode;
  target: CustomResourceTarget | BuiltinResourceTarget;
  nodeData: any;
  className?: string;
  active?: boolean;
  expand?: boolean;
}

export default function BaseNodeWrapper({
  children,
  target,
  nodeData,
  className,
  active = true,
  expand = false,
}: BaseNodeProps) {
  const nodeRef = useRef(null);

  // Handle node click to open chat sidebar and set selected node
  const { openSidebarChat } = useChatActions();

  const { selectedNode } = useFlowgraphState();
  const { selectNode } = useFlowgraphActions();

  const alreadySelected = selectedNode === nodeData;

  const handleNodeClick = () => {
    if (active) {
      selectNode(nodeData);
      openSidebarChat();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode
          selected={alreadySelected}
          className={className}
          ref={nodeRef}
          onClick={handleNodeClick}
          expand={expand}
        >
          <Handle position={Position.Top} type="source" />
          {children}
          <Handle position={Position.Bottom} type="target" />
        </BaseNode>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
