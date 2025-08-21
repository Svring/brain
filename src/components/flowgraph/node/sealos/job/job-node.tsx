"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import BaseNode from "../../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

function JobNodeTitle({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <Briefcase className="h-9 w-9 text-muted-foreground flex-shrink-0" />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              Job
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

export default function JobNode({ data }: { data: BuiltinResourceTarget }) {
  const { resourceType, name } = data;

  return (
    <BaseNode
      nodeData={{ kind: resourceType, name: name || "" }}
      className=""
    >
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name */}
        <div className="flex items-center justify-between">
          <JobNodeTitle name={name || ""} />
        </div>
      </div>
    </BaseNode>
  );
}
