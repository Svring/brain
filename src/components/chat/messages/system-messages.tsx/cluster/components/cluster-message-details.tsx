import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Cpu, MemoryStick, HardDrive, PenLine, Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ClusterMessageDetailsProps {
  target: CustomResourceTarget;
}

const ClusterMessageDetails: React.FC<ClusterMessageDetailsProps> = ({
  target,
}) => {
  const { auth } = useAuthState();

  const { resource, isLoading, error } = useResourceStatus(target);

  // State for resource edit mode
  const [isResourceEditing, setIsResourceEditing] = useState(false);

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

  const handleResourceSave = () => {
    // TODO: Implement save functionality
    console.log("Saving cluster resource configuration");
    setIsResourceEditing(false);
  };

  const handleResourceCancel = () => {
    setIsResourceEditing(false);
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

      {/* Created At */}
      {clusterObject.operationalStatus && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium truncate flex-1">
            {clusterObject.operationalStatus.createdAt}
          </span>
        </div>
      )}

      {/* Resource Quota Section */}
      <div className="border border-dashed rounded-lg">
        <div className="flex items-center justify-between p-2 border-b border-dashed">
          <h3 className="font-medium">Quota</h3>
          {isResourceEditing ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-1"
                onClick={handleResourceSave}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-1"
                onClick={handleResourceCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="h-6 w-6 p-1"
              onClick={() => setIsResourceEditing(true)}
            >
              <PenLine className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="p-2">
          {isResourceEditing ? (
            <div className="text-sm text-muted-foreground">
              Resource editing functionality coming soon...
            </div>
          ) : (
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">CPU</div>
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {formatValue(clusterObject.resource?.cpu, "cpu")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Memory</div>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {formatValue(clusterObject.resource?.memory, "memory")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Storage</div>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {formatValue(clusterObject.resource?.storage, "storage")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Replicas</div>
                <div className="h-4 w-4 flex items-center justify-center text-muted-foreground">
                  <span className="text-xs">#</span>
                </div>
                <div className="text-sm font-medium">
                  {clusterObject.resource?.replicas || "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClusterMessageDetails;
