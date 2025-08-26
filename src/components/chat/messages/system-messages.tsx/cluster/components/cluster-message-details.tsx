import React from "react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  composeClusterPublicConnectionString,
  composeClusterPrivateConnectionString,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface ClusterMessageDetailsProps {
  clusterObject: ClusterObject;
}

const ClusterMessageDetails: React.FC<ClusterMessageDetailsProps> = ({
  clusterObject,
}) => {
  const { auth } = useAuthState();

  const formatValue = (value: any, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}m`;
    if (type === "memory") return `${value}MB`;
    if (type === "storage") return `${value}GB`;
    return value;
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ");
  };

  return (
    <div className="space-y-4">
      {/* Type and Version Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Type & Version</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{clusterObject.version}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className="text-sm font-medium">
            {clusterObject.status || "N/A"}
          </span>
        </div>
      </div>

      {/* Created At and Replicas Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium">
            {clusterObject.operationalStatus?.createdAt}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Replicas</span>
          <span className="text-sm font-medium">
            {clusterObject.resource?.replicas || "N/A"}
          </span>
        </div>
      </div>

      {/* CPU and Memory Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">CPU</span>
          <span className="text-sm font-medium">
            {formatValue(clusterObject.resource?.cpu, "cpu")}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Memory</span>
          <span className="text-sm font-medium">
            {formatValue(clusterObject.resource?.memory, "memory")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClusterMessageDetails;
