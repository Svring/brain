"use client";

import React from "react";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface ClusterNodeTitleProps {
  name: string;
  type: string;
}

export default function ClusterNodeTitle({
  name,
  type,
}: ClusterNodeTitleProps) {
  const iconUrl = getClusterIconUrl(type);

  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <img
            src={iconUrl}
            alt={`${type} Icon`}
            width={24}
            height={24}
            className="rounded-lg h-9 w-9 flex-shrink-0 p-1 bg-muted"
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              Database
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {name.length > 15 ? `${name.slice(0, 15)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
