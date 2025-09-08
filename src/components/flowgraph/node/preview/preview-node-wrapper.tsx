"use client";

import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flowgraph/components/base-node";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { cn } from "@/lib/utils";

interface PreviewNodeWrapperProps {
  children: React.ReactNode;
  nodeId: any;
  target: ResourceTarget;
  className?: string;
}

export default function PreviewNodeWrapper({
  children,
  nodeId,
  target,
  className,
}: PreviewNodeWrapperProps) {
  return (
    <BaseNode className={cn(className, "w-40 h-25 p-2")} >
      <Handle position={Position.Top} type="source" />
      {children}
      <Handle position={Position.Bottom} type="target" />
    </BaseNode>
  );
}
