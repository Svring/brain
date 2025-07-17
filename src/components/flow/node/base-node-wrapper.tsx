"use client";

import { Handle, Position, NodeToolbar } from "@xyflow/react";
import { BaseNode } from "@/components/flow/components/base-node";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useDeleteResourceMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { useRemoveFromProjectMutation } from "@/lib/app/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useRef, useState, useEffect } from "react";
import FloatingActionMenu from "@/components/flow/components/floating-action-menu";
import { Trash2 } from "lucide-react";

interface BaseNodeProps {
  children: React.ReactNode;
  target: CustomResourceTarget | BuiltinResourceTarget;
  className?: string;
  floatingMenuOptions?: {
    label: string;
    onClick: () => void;
    Icon?: React.ReactNode;
  }[];
}

export default function BaseNodeWrapper({
  children,
  target,
  className,
  floatingMenuOptions,
}: BaseNodeProps) {
  const context = createK8sContext();
  const removeFromProjectMutation = useRemoveFromProjectMutation(context);
  const deleteResourceMutation = useDeleteResourceMutation(context);
  const nodeRef = useRef(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isNodeHovered, setIsNodeHovered] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Timeout reference to control delayed hiding
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Custom hover handlers for node
  const handleNodeMouseEnter = () => setIsNodeHovered(true);
  const handleNodeMouseLeave = () => setIsNodeHovered(false);

  // Custom hover handlers for menu
  const handleMenuMouseEnter = () => setIsMenuHovered(true);
  const handleMenuMouseLeave = () => setIsMenuHovered(false);

  // Effect to manage menu visibility
  useEffect(() => {
    if (isNodeHovered || isMenuHovered) {
      // Clear any existing timeout to prevent hiding
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsMenuVisible(true);
    } else {
      // Set a timeout to hide the menu after 300ms
      timeoutRef.current = setTimeout(() => {
        setIsMenuVisible(false);
      }, 300);
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isNodeHovered, isMenuHovered]);

  const defaultMenuOptions = [
    {
      label: "Remove from project",
      onClick: () =>
        removeFromProjectMutation.mutate({
          resources: [target],
        }),
      Icon: <Trash2 className="w-4 h-4" />,
    },
    {
      label: "Delete resource",
      onClick: () =>
        deleteResourceMutation.mutate({
          target: target,
        }),
      Icon: <Trash2 className="w-4 h-4" />,
    },
  ];

  const menuOptions = [...(floatingMenuOptions ?? []), ...defaultMenuOptions];

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseNode
          className={className}
          ref={nodeRef}
          onMouseEnter={handleNodeMouseEnter}
          onMouseLeave={handleNodeMouseLeave}
        >
          <Handle position={Position.Top} type="source" />
          {children}
          <Handle position={Position.Bottom} type="target" />
        </BaseNode>
        <NodeToolbar isVisible={isMenuVisible} position={Position.Right}>
          <div
            ref={menuRef}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
            style={{ position: "relative" }}
          >
            <FloatingActionMenu
              className="static bottom-auto right-auto"
              options={menuOptions}
            />
          </div>
        </NodeToolbar>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
