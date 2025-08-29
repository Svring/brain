import React from "react";
import {
  ClusterObject,
  ClusterObjectSchema,
} from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/contexts/auth/auth-context";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  composeClusterPublicConnectionString,
  composeClusterPrivateConnectionString,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface ClusterMessageDetailsProps {
  target: CustomResourceTarget;
}

const ClusterMessageDetails: React.FC<ClusterMessageDetailsProps> = ({
  target,
}) => {
  const { auth } = useAuthState();

  const { resource, isLoading, error } = useResourceStatus(target);

  // Parse the resource data
  const clusterObject = resource ? ClusterObjectSchema.parse(resource) : null;

  const formatValue = (value: any, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}Core`;
    if (type === "memory") return `${value}GB`;
    if (type === "storage") return `${value}GB`;
    return value;
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Loading cluster information...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !clusterObject) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-red-600 font-medium">
            Failed to load cluster information
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Type and Version Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Type & Version</span>
        <span className="text-sm font-medium truncate flex-1">
          {clusterObject.version}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status</span>
        <span className="text-sm font-medium truncate flex-1">
          {clusterObject.status || "N/A"}
        </span>
      </div>

      {/* Created At */}
      {clusterObject.operationalStatus && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium truncate flex-1">
            {clusterObject.operationalStatus.createdAt}
          </span>
        </div>
      )}

      {/* CPU, Memory, Storage, and Replicas in a single row with borders */}
      <div className="flex items-center border rounded-lg p-3">
        <div className="flex-1 text-center border-r last:border-r-0">
          <div className="text-sm text-muted-foreground">CPU</div>
          <div className="text-sm font-medium">
            {formatValue(clusterObject.resource?.cpu, "cpu")}
          </div>
        </div>
        <div className="flex-1 text-center border-r last:border-r-0">
          <div className="text-sm text-muted-foreground">Memory</div>
          <div className="text-sm font-medium">
            {formatValue(clusterObject.resource?.memory, "memory")}
          </div>
        </div>
        <div className="flex-1 text-center border-r last:border-r-0">
          <div className="text-sm text-muted-foreground">Storage</div>
          <div className="text-sm font-medium">
            {formatValue(clusterObject.resource?.storage, "storage")}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-muted-foreground">Replicas</div>
          <div className="text-sm font-medium">
            {clusterObject.resource?.replicas || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterMessageDetails;
