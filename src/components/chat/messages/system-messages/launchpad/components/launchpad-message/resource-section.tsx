"use client";

import React, { useState } from "react";
import { Cpu, CpuIcon, MemoryStick, MemoryStickIcon } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { MonitorChart } from "../../../components/monitor-chart";
import { Button } from "@/components/ui/button";
import { LaunchpadResourceUpdateForm } from "@/components/forms/launchpad/launchpad-resource-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLaunchpadUpdate } from "@/hooks/sealos/launchpad/use-launchpad-update";

interface ResourceSectionProps {
  target: BuiltinResourceTarget;
  onSectionClick: () => void;
}

// Resource Popover Content Component
export const ResourcePopoverContent: React.FC<{
  target: BuiltinResourceTarget;
}> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: launchpadObject } = useResourceStatus(target);
  const { latestData, isLoading: isMetricsLoading } = useResourceMetricsStatus({
    target,
  });

  // Get real-time usage from metrics
  const cpuUsage = latestData?.cpu || 0;
  const memoryUsage = latestData?.memory || 0;

  // Get resource limits from launchpad object
  const cpuLimit = launchpadObject?.resource?.cpu || 0;
  const memoryLimit = launchpadObject?.resource?.memory || 0;

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
      console.log("Updating launchpad resources:", data);
      await updateLaunchpad(data);
    } catch (error) {
      console.error("Error updating launchpad resources:", error);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full rounded-lg space-y-3">
        <LaunchpadResourceUpdateForm
          key={`resource-edit-${target.name}`}
          defaultValues={{
            name: launchpadObject?.name || target.name!,
            resource: {
              cpu: cpuLimit,
              memory: memoryLimit,
            },
          }}
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
            form="launchpad-resource-update-form"
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

  return (
    <div className="w-full rounded-lg space-y-3">
      {/* CPU and Memory Values Display */}
      <div className="flex items-center border p-2 rounded-lg justify-around">
        <div className="flex items-center gap-2">
          <CpuIcon className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">CPU</div>
            <div className="text-sm font-medium">{cpuLimit} Core</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MemoryStickIcon className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Memory</div>
            <div className="text-sm font-medium">{memoryLimit} GB</div>
          </div>
        </div>
      </div>

      {/* Monitor Chart */}
      <MonitorChart target={target} />

      {/* Edit Button - Full Row */}
      <div className="w-full flex">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setIsEditing(true)}
        >
          Edit Resources
        </Button>
      </div>
    </div>
  );
};

export const ResourceSection: React.FC<ResourceSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: launchpadObject } = useResourceStatus(target);
  const { latestData, isLoading: isMetricsLoading } = useResourceMetricsStatus({
    target,
  });

  // Get real-time usage from metrics
  const cpuUsage = latestData?.cpu || 0;
  const memoryUsage = latestData?.memory || 0;

  // Get resource limits from launchpad object
  const cpuLimit = launchpadObject?.resource?.cpu || 0;
  const memoryLimit = launchpadObject?.resource?.memory || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors w-full min-w-0"
      onClick={onSectionClick}
    >
      <div className="flex gap-2 min-w-0">
        {/* CPU */}
        <div className="flex-1 flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">CPU</span>
            <span className="text-xs font-mono font-semibold">
              {cpuLimit} Core
            </span>
          </div>
        </div>

        {/* Memory */}
        <div className="flex-1 flex items-center gap-2">
          <MemoryStick className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Memory</span>
            <span className="text-xs font-mono font-semibold">
              {memoryLimit} GB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSection;
