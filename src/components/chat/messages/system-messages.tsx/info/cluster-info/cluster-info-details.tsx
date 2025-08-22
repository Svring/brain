import React from "react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface ClusterInfoDetailsProps {
  clusterData: ClusterObject;
}

export const ClusterInfoDetails: React.FC<ClusterInfoDetailsProps> = ({
  clusterData,
}) => {
  const formatValue = (value: any, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}m`;
    if (type === "memory") return `${value}MB`;
    if (type === "storage") return `${value}GB`;
    return value;
  };

  return (
    <div className="space-y-4">
      {/* Created At and Replicas Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium">
            {clusterData.operationalStatus?.createdAt}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Replicas</span>
          <span className="text-sm font-medium">
            {clusterData.resource?.replicas || "N/A"}
          </span>
        </div>
      </div>

      {/* CPU and Memory Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">CPU</span>
          <span className="text-sm font-medium">
            {formatValue(clusterData.resource?.cpu, "cpu")}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Memory</span>
          <span className="text-sm font-medium">
            {formatValue(clusterData.resource?.memory, "memory")}
          </span>
        </div>
      </div>
    </div>
  );
};
