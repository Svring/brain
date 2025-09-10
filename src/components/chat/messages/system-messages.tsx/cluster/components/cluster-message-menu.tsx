"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import ClusterDropdownMenu from "./universal/cluster-dropdown-menu";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface ClusterMessageMenuProps {
  target: CustomResourceTarget;
}

export default function ClusterMessageMenu({
  target,
}: ClusterMessageMenuProps) {
  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const clusterName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  // Don't render if we don't have a valid cluster name
  if (!clusterName) {
    return null;
  }

  // Create cluster object for the dropdown menu
  const clusterObject: ClusterObject = {
    name: clusterName,
    status: currentStatus,
    resource: resource,
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <ClusterDropdownMenu
          object={clusterObject}
          onDelete={(clusterName) => {
            // Handle delete callback if needed
            console.log("Delete cluster:", clusterName);
          }}
        />
      </DropdownMenu>
    </div>
  );
}
