"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import ClusterIconButtons from "./universal/cluster-icon-buttons";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface ClusterMessageMenuProps {
  target: CustomResourceTarget;
}

export default function ClusterMessageMenu({
  target,
}: ClusterMessageMenuProps) {
  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target) as {
    resource: ClusterObject;
    status: string;
  };
  const clusterName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  // Don't render if we don't have a valid cluster name
  if (!clusterName) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <ClusterIconButtons
        object={resource}
        onDelete={(clusterName) => {
          // Handle delete callback if needed
          console.log("Delete cluster:", clusterName);
        }}
      />
    </div>
  );
}
