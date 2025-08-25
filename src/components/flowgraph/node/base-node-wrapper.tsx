"use client";

import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flowgraph/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useRef } from "react";
import { useChatActions } from "@/contexts/chat/chat-context";
import {
  useFlowgraphState,
  useFlowgraphActions,
} from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface BaseNodeProps {
  children: React.ReactNode;
  nodeData: any;
  target?: ResourceTarget;
  className?: string;
}

export default function BaseNodeWrapper({
  children,
  nodeData,
  target,
  className,
}: BaseNodeProps) {
  const nodeRef = useRef(null);

  const { selectedNode } = useFlowgraphState();
  const { selectNode } = useFlowgraphActions();

  const { selectResource } = useProjectActions();

  const alreadySelected = selectedNode === nodeData;

  const handleNodeClick = () => {
    selectNode(nodeData);
    if (target) {
      selectResource(target);
    }
    // openSidebarChat();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode
          selected={alreadySelected}
          className={className}
          ref={nodeRef}
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
