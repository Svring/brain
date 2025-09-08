"use client";

import React from "react";
import { Globe } from "lucide-react";
import { BaseNode } from "@/components/flowgraph/components/base-node";
import { Handle, Position } from "@xyflow/react";

interface NetworkPreviewNodeProps {
  data: {
    target: {
      type: "custom" | "builtin";
      resourceType: string;
      name: string;
    };
  };
}

export default function NetworkPreviewNode({ data }: NetworkPreviewNodeProps) {
  const { target } = data;
  const { name } = target;

  return (
    <BaseNode className="w-40 h-8 p-2">
      <Handle position={Position.Top} type="source" />
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center justify-center gap-2 text-sm w-full">
          <Globe className="h-4 w-4 flex-shrink-0 text-theme-green" />
          <span className="text-sm text-foreground">Public Access</span>
        </div>
      </div>
      <Handle position={Position.Bottom} type="target" />
    </BaseNode>
  );
}
