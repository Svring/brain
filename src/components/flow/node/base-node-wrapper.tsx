"use client";

import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flow/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useDeleteResourceMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { useRemoveFromProjectMutation } from "@/lib/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { useProjectState } from "@/contexts/project/project-context";
import { useAiActions } from "@/contexts/ai/ai-context";
import { useFlowActions } from "@/contexts/flow/flow-context";
import HoverableNodeWrapper from "@/components/flow/components/hoverable-node-wrapper";

interface BaseNodeProps {
  children: React.ReactNode;
  target: CustomResourceTarget | BuiltinResourceTarget;
  nodeData: any;
  className?: string;
  showDefaultMenu?: boolean;
  floatingMenuOptions?: {
    label: string;
    onClick: () => void;
    Icon?: React.ReactNode;
  }[];
}

export default function BaseNodeWrapper({
  children,
  target,
  nodeData,
  className,
  showDefaultMenu = true,
  floatingMenuOptions,
}: BaseNodeProps) {
  const context = createK8sContext();
  const { flowGraphData } = useProjectState();
  const projectName = flowGraphData.project;
  const removeFromProjectMutation = useRemoveFromProjectMutation(context);
  const deleteResourceMutation = useDeleteResourceMutation(context);
  const nodeRef = useRef(null);

  // Handle node click to open chat sidebar and set selected node
  const { openChat } = useAiActions();
  const { setSelectedNode } = useFlowActions();
  const handleNodeClick = () => {
    setSelectedNode(nodeData);
    openChat();
  };

  const defaultMenuOptions = [
    {
      label: "Remove from project",
      onClick: (e: Event) => {
        e.stopPropagation();
        removeFromProjectMutation.mutate({
          resources: [target],
          projectName,
        });
      },
      Icon: <Trash2 className="w-4 h-4" />,
    },
    {
      label: "Delete resource",
      onClick: (e: Event) => {
        e.stopPropagation();
        deleteResourceMutation.mutate({
          target: target,
        });
      },
      Icon: <Trash2 className="w-4 h-4" />,
    },
  ];

  const menuOptions = [
    ...(floatingMenuOptions ?? []),
    ...(showDefaultMenu ? defaultMenuOptions : []),
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <HoverableNodeWrapper menuOptions={menuOptions}>
          <BaseNode
            className={className}
            ref={nodeRef}
            onClick={handleNodeClick}
          >
            <Handle position={Position.Top} type="source" />
            {children}
            <Handle position={Position.Bottom} type="target" />
          </BaseNode>
        </HoverableNodeWrapper>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
