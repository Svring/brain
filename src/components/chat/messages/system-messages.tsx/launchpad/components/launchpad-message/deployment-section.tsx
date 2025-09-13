"use client";

import React, { useState } from "react";
import { Server, Users, TrendingUp } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { Button } from "@/components/ui/button";
import { LaunchpadDeploymentUpdateForm } from "@/components/forms/launchpad/launchpad-deployment-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

  const queryClient = useQueryClient();
  const { launchpad } = useTRPCClients();

  const updateLaunchpad = useMutation(launchpad.update.mutationOptions());

  const handleFormSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      const updateRequest = { name: target.name!, request: data };
      await updateLaunchpad.mutateAsync(updateRequest, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.get.queryKey(target),
          });
          toast.success("Launchpad updated successfully!");
          setIsEditing(false);
        },
        onError: () => {
          toast.error("Failed to update launchpad");
        },
      });
    } catch (error) {
      console.error("Error updating launchpad deployment:", error);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full rounded-lg space-y-3">
        <LaunchpadDeploymentUpdateForm
          key={`deployment-edit-${target.name}`}
          defaultValues={{
            name: parsedLaunchpadObject?.name || target.name!,
            resource: {
              replicas: parsedLaunchpadObject?.resource?.replicas || 1,
              hpa: parsedLaunchpadObject?.strategy ? {
                target: (parsedLaunchpadObject.strategy.threshold?.resource as "cpu" | "memory" | "gpu") || "cpu",
                value: parsedLaunchpadObject.strategy.threshold?.usage || 70,
                minReplicas: parsedLaunchpadObject.strategy.minReplicas || 1,
                maxReplicas: parsedLaunchpadObject.strategy.maxReplicas || 10,
              } : null,
            },
          }}
          onSubmit={handleFormSubmit}
          isLoading={updateLaunchpad.isPending}
        />
        
        {/* Cancel and Confirm Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setIsEditing(false)}
            disabled={updateLaunchpad.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="launchpad-deployment-update-form"
            variant="default" 
            size="sm" 
            className="flex-1"
            disabled={updateLaunchpad.isPending}
          >
            {updateLaunchpad.isPending ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg space-y-3">
      {/* Replicas and Strategy Display */}
      <div className="flex items-center border p-2 rounded-lg justify-around">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Replicas</div>
            <div className="text-sm font-medium">
              {parsedLaunchpadObject?.resource?.replicas || 1}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Strategy</div>
            <div className="text-sm font-medium">
              {parsedLaunchpadObject?.strategy?.type || "Fixed"}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Details */}
      {parsedLaunchpadObject?.strategy && (
        <div className="p-2 bg-background-tertiary rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Strategy Details</div>
          {parsedLaunchpadObject.strategy.type === "flexible" && (
            <div className="text-xs space-y-1">
              <div>Min: {parsedLaunchpadObject.strategy.minReplicas || 1}</div>
              <div>Max: {parsedLaunchpadObject.strategy.maxReplicas || 10}</div>
              {parsedLaunchpadObject.strategy.threshold && (
                <div>
                  Threshold: {parsedLaunchpadObject.strategy.threshold.usage}% 
                  ({parsedLaunchpadObject.strategy.threshold.resource})
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Button - Full Row */}
      <div className="w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
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

  const replicas = parsedLaunchpadObject?.resource?.replicas || 1;
  const strategyType = parsedLaunchpadObject?.strategy?.type || "Fixed";

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex gap-2">
        {/* Replicas */}
        <div className="flex-1 flex items-center gap-2">
          <Users className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Replicas</span>
            <span className="text-xs text-muted-foreground">
              {replicas}
            </span>
          </div>
        </div>

        {/* Strategy */}
        <div className="flex-1 flex items-center gap-2">
          <TrendingUp
            className="h-5 w-5"
            style={{ color: "hsl(var(--chart-3))" }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Strategy</span>
            <span className="text-xs text-muted-foreground">
              {strategyType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentSection;
