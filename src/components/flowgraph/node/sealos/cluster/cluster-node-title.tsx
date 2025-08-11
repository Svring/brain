"use client";

import React from "react";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/cluster/cluster-constant/cluster-constant-icons";

interface ClusterNodeTitleProps {
  name: string;
  type: string;
}

export default function ClusterNodeTitle({
  name,
  type,
}: ClusterNodeTitleProps) {
  const iconUrl =
    CLUSTER_TYPE_ICON_MAP[type as keyof typeof CLUSTER_TYPE_ICON_MAP];

  return (
    <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
      <div className="flex flex-col items-start">
        <span className="flex items-center gap-4">
          <Image
            src={iconUrl || "https://dbprovider.bja.sealos.run/logo.svg"}
            alt={`${type} Icon`}
            width={24}
            height={24}
            className="rounded-lg h-9 w-9 flex-shrink-0"
            priority
          />
          <span className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              Database Provider
            </span>
            <span className="text-lg font-bold text-foreground leading-tight truncate">
              {name.length > 8 ? `${name.slice(0, 8)}...` : name}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
