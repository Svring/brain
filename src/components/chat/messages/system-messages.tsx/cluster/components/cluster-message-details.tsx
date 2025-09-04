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
import { Separator } from "@/components/ui/separator";
import { ResourceQuota } from "./cluster-message-detail/resource-quota";

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

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ");
  };

  const handleResourceSubmit = async (type: string, data?: any) => {
    // TODO: Implement save functionality
    console.log("Saving cluster resource configuration:", data);
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
      <ResourceQuota
        resource={
          Array.isArray(clusterObject.resource) || !clusterObject.resource
            ? undefined
            : {
                cpu: clusterObject.resource.cpu ?? undefined,
                memory: clusterObject.resource.memory ?? undefined,
                storage: clusterObject.resource.storage ?? undefined,
                replicas: clusterObject.resource.replicas ?? undefined,
              }
        }
        onResourceUpdate={handleResourceSubmit}
        isLoading={false}
      />
    </div>
  );
};

export default ClusterMessageDetails;
