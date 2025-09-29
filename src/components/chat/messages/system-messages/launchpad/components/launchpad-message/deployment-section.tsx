"use client";

import React, { useState } from "react";
import { Server, Layers, TrendingUp } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { Button } from "@/components/ui/button";
import { LaunchpadDeploymentUpdateForm } from "@/components/forms/launchpad/launchpad-deployment-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLaunchpadUpdate } from "@/hooks/sealos/launchpad/use-launchpad-update";

interface DeploymentSectionProps {
  target: BuiltinResourceTarget;
  onSectionClick: () => void;
}

// Deployment Popover Content Component
export const DeploymentPopoverContent: React.FC<{
  target: BuiltinResourceTarget;
}> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const { updateLaunchpad, isLoading: isUpdating } = useLaunchpadUpdate({
    onSuccess: () => {
      setIsEditing(false);
    },
    onError: () => {
      // Error handling is already done in the hook
    },
  });

  const handleFormSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      console.log("Updating launchpad deployment:", data);
      await updateLaunchpad(data);
    } catch (error) {
      console.error("Error updating launchpad deployment:", error);
    }
  };

  console.log("parsedLaunchpadObject", parsedLaunchpadObject);

  if (isEditing) {
    return (
      <div className="w-full rounded-lg space-y-3">
        <LaunchpadDeploymentUpdateForm
          key={`deployment-edit-${target.name}`}
          defaultValues={{
            name: parsedLaunchpadObject?.name || target.name!,
            resource: {
              replicas: parsedLaunchpadObject?.resource?.replicas,
              hpa: parsedLaunchpadObject?.strategy
                ? {
                    target:
                      (parsedLaunchpadObject.strategy.threshold?.resource as
                        | "cpu"
                        | "memory"
                        | "gpu") || "cpu",
                    value:
                      parsedLaunchpadObject.strategy.threshold?.usage || 70,
                    minReplicas:
                      parsedLaunchpadObject.strategy.minReplicas || 1,
                    maxReplicas:
                      parsedLaunchpadObject.strategy.maxReplicas || 10,
                  }
                : undefined,
            },
          }}
          initialScalingMode={
            parsedLaunchpadObject?.strategy?.type === "flexible"
              ? "hpa"
              : "replicas"
          }
          onSubmit={handleFormSubmit}
          isLoading={isUpdating}
        />

        {/* Cancel and Confirm Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="launchpad-deployment-update-form"
            variant="default"
            size="sm"
            className="flex-1"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  const getModeDisplay = () => {
    if (parsedLaunchpadObject?.strategy?.type === "flexible") {
      return "Flexible";
    }
    return "Fixed";
  };

  const getReplicasDisplay = () => {
    if (parsedLaunchpadObject?.strategy?.type === "flexible") {
      return `${parsedLaunchpadObject.strategy.minReplicas || 1}-${
        parsedLaunchpadObject.strategy.maxReplicas || 10
      }`;
    }
    return parsedLaunchpadObject?.resource?.replicas || 1;
  };

  return (
    <div className="w-full rounded-lg space-y-3">
      {/* Deployment Display */}
      <div className="flex items-center justify-around">
        {/* Mode */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm text-muted-foreground">Mode</div>
          <div className="text-sm font-medium capitalize">
            {getModeDisplay()}
          </div>
        </div>

        {/* Replicas */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm text-muted-foreground">Replicas</div>
          <div className="text-sm font-medium">{getReplicasDisplay()}</div>
        </div>

        {/* Flexible Strategy Details */}
        {parsedLaunchpadObject?.strategy?.type === "flexible" && (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Target</div>
              <div className="text-sm font-medium capitalize">
                {parsedLaunchpadObject.strategy.threshold?.resource || "CPU"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Threshold</div>
              <div className="text-sm font-medium">
                {parsedLaunchpadObject.strategy.threshold?.usage
                  ? `${parsedLaunchpadObject.strategy.threshold.usage}%`
                  : "N/A"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Button - Full Row */}
      <div className="w-full flex">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setIsEditing(true)}
        >
          Edit Deployment
        </Button>
      </div>
    </div>
  );
};

export const DeploymentSection: React.FC<DeploymentSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const getModeDisplay = () => {
    if (parsedLaunchpadObject?.strategy?.type === "flexible") {
      return "Flexible";
    }
    return "Fixed";
  };

  const getReplicasDisplay = () => {
    if (parsedLaunchpadObject?.strategy?.type === "flexible") {
      return `${parsedLaunchpadObject.strategy.minReplicas || 1}-${
        parsedLaunchpadObject.strategy.maxReplicas || 10
      }`;
    }
    return parsedLaunchpadObject?.resource?.replicas || 1;
  };

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors w-full min-w-0"
      onClick={onSectionClick}
    >
      <div className="flex gap-2 min-w-0">
        {/* Mode */}
        <div className="flex-1 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Mode</span>
            <span className="text-xs text-muted-foreground capitalize">
              {getModeDisplay()}
            </span>
          </div>
        </div>

        {/* Replicas */}
        <div className="flex-1 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Replicas</span>
            <span className="text-xs text-muted-foreground">
              {getReplicasDisplay()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentSection;
