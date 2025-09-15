"use client";

import React from "react";
import { Network } from "lucide-react";
import BaseNode from "../../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

function ServiceNodeTitle({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <Network className="h-9 w-9 text-muted-foreground flex-shrink-0" />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              Service
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {name.length > 8 ? `${name.slice(0, 15)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}

export default function ServiceNode({ data }: { data: BuiltinResourceTarget }) {
  const { resourceType, name } = data;

  // Construct node ID following the same pattern as other nodes
  const nodeId = `${resourceType?.toLowerCase() || "service"}-${name || ""}`;

  return (
    <BaseNode
      nodeId={nodeId}
      className=""
    >
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name */}
        <div className="flex items-center justify-between">
          <ServiceNodeTitle name={name || ""} />
        </div>
      </div>
    </BaseNode>
  );
}
