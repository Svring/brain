"use client";

import React from "react";
import BaseNode from "../base-node-wrapper";
import NodeStatus from "./node-status";
import { Package, Database, Server, HardDrive } from "lucide-react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

interface NodeLoadingProps {
  kind: string;
  name: string;
  status?: string;
}

// Icon mapping for different resource kinds
const getIconForKind = (kind: string) => {
  const lowerKind = kind.toLowerCase();

  switch (lowerKind) {
    case "devbox":
      return <Package className="h-4 w-4 text-muted-foreground" />;
    case "cluster":
      return <Database className="h-4 w-4 text-muted-foreground" />;
    case "deployment":
    case "statefulset":
      return <Server className="h-4 w-4 text-muted-foreground" />;
    case "objectstoragebucket":
      return <HardDrive className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function NodeLoading({
  kind,
  name,
  status = "Pending",
}: NodeLoadingProps) {
  const IconComponent = getIconForKind(kind);
  const target = convertResourceTypeToTarget(kind, name);

  return (
    <BaseNode className="opacity-75" nodeId={target.name} target={target}>
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Kind Icon and Name */}
        <div className="flex items-center gap-2">
          {IconComponent}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-foreground">{name}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {kind.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-2">
          <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>

        {/* Bottom section with status */}
        <div className="mt-auto flex justify-between items-center">
          <NodeStatus status={status} />
        </div>
      </div>
    </BaseNode>
  );
}
