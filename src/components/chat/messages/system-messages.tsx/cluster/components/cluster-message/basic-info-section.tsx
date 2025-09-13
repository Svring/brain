"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { ClusterObjectSchema } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface BasicInfoSectionProps {
  target: CustomResourceTarget;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  target,
}) => {
  const { resource: clusterResource } = useResourceStatus(target);
  const parsedClusterObject = clusterResource
    ? ClusterObjectSchema.parse(clusterResource)
    : null;

  // Helper function to format uptime (using status as a proxy for uptime info)
  const getUptime = (status: string) => {
    if (!status) return "Unknown";
    return status === "Running" ? "Active" : status;
  };

  return (
    <div className="p-2 border rounded-lg">
      <div className="flex gap-4">
        {/* Version */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Version</span>
          <span className="text-xs text-muted-foreground truncate">
            {parsedClusterObject?.version || "Unknown"}
          </span>
        </div>

        {/* Created At */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Created</span>
          <span className="text-xs text-muted-foreground truncate">
            {parsedClusterObject?.operationalStatus?.createdAt || "Unknown"}
          </span>
        </div>

        {/* Status */}
        <div className="flex-1 flex flex-col">
          <span className="font-medium text-sm">Status</span>
          <span className="text-xs text-muted-foreground truncate">
            {getUptime(parsedClusterObject?.status || "")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
