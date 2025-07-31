"use client";

import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flow/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useRef } from "react";
import { useAiActions } from "@/contexts/ai/ai-context";
import { useFlowActions } from "@/contexts/flow/flow-context";

interface BaseNodeProps {
  children: React.ReactNode;
  target: CustomResourceTarget | BuiltinResourceTarget;
  nodeData: any;
  className?: string;
  active?: boolean;
}

export default function BaseNodeWrapper({
  children,
  target,
  nodeData,
  className,
  active = true,
}: BaseNodeProps) {
  const nodeRef = useRef(null);

  // Handle node click to open chat sidebar and set selected node
  const { openChat } = useAiActions();
  const { setSelectedNode } = useFlowActions();
  const handleNodeClick = () => {
    if (active) {
      setSelectedNode(nodeData);
      openChat();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode className={className} ref={nodeRef} onClick={handleNodeClick}>
          <Handle position={Position.Top} type="source" />
          {children}
          <Handle position={Position.Bottom} type="target" />
        </BaseNode>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
