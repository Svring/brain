import React, { useState } from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseSystemMessage from "@/components/chat/messages/system-messages/components/base-system-message";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { BarChart3, Edit } from "lucide-react";
import { MonitorChart } from "@/components/chat/messages/system-messages/components/monitor-chart";
import { Button } from "@/components/ui/button";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { ClusterUpdateForm } from "@/components/forms/cluster/cluster-update-form";
import { LaunchpadResourceUpdateForm } from "@/components/forms/launchpad/launchpad-resource-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { useDevboxUpdate } from "@/hooks/sealos/devbox/use-devbox-update";
import { useClusterUpdate } from "@/hooks/sealos/cluster/use-cluster-update";
import { useLaunchpadUpdate } from "@/hooks/sealos/launchpad/use-launchpad-update";

interface MonitorMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorMessage: React.FC<MonitorMessageProps> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: resourceData } = useResourceStatus(target);
  
  // Update hooks for different resource types
  const { updateDevbox, isLoading: isDevboxUpdating } = useDevboxUpdate({
    onSuccess: () => setIsEditing(false),
  });
  
  const { updateCluster, isLoading: isClusterUpdating } = useClusterUpdate({
    onSuccess: () => setIsEditing(false),
  });
  
  const { updateLaunchpad, isLoading: isLaunchpadUpdating } = useLaunchpadUpdate({
    onSuccess: () => setIsEditing(false),
  });

  const getResourceType = () => {
    if (target.type === "custom") {
      return target.resourceType?.toLowerCase() || "";
    }
    return target.resourceType?.toLowerCase() || "";
  };

  const handleFormSubmit = async (data: any) => {
    const resourceType = getResourceType();
    
    try {
      switch (resourceType) {
        case "devbox":
          await updateDevbox(data as DevboxUpdateFormData);
          break;
        case "cluster":
          await updateCluster(data as ClusterUpdateFormData);
          break;
        case "deployment":
        case "statefulset":
          await updateLaunchpad(data as LaunchpadUpdateFormData);
          break;
        default:
          console.warn(`Unknown resource type: ${resourceType}`);
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const renderUpdateForm = () => {
    const resourceType = getResourceType();
    const isLoading = isDevboxUpdating || isClusterUpdating || isLaunchpadUpdating;

    switch (resourceType) {
      case "devbox":
        return (
          <DevboxUpdateForm
            key={`devbox-edit-${target.name}`}
            defaultValues={{
              name: resourceData?.name || target.name!,
              resource: resourceData?.resource,
              ports: resourceData?.ports,
            }}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        );
      
      case "cluster":
        return (
          <ClusterUpdateForm
            key={`cluster-edit-${target.name}`}
            defaultValues={{
              name: resourceData?.name || target.name!,
              resource: resourceData?.resource,
            }}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        );
      
      case "deployment":
      case "statefulset":
        return (
          <LaunchpadResourceUpdateForm
            key={`launchpad-edit-${target.name}`}
            defaultValues={{
              name: resourceData?.name || target.name!,
              resource: resourceData?.resource,
            }}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        );
      
      default:
        return null;
    }
  };

  const getHeaderSlot = () => {
    if (isEditing) {
      const isLoading = isDevboxUpdating || isClusterUpdating || isLaunchpadUpdating;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={`${getResourceType()}-update-form`}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Confirm"}
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2"
      >
        <Edit className="h-3 w-3" />
        Update
      </Button>
    );
  };

  if (isEditing) {
    return (
      <BaseSystemMessage
        headerTitle={{
          icon: BarChart3,
          name: "Update Resource",
        }}
        headerSlot={getHeaderSlot()}
      >
        {renderUpdateForm()}
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage
      headerTitle={{
        icon: BarChart3,
        name: "Resource Metrics",
      }}
      headerSlot={getHeaderSlot()}
    >
      <MonitorChart target={target} />
    </BaseSystemMessage>
  );
};

export default MonitorMessage;
