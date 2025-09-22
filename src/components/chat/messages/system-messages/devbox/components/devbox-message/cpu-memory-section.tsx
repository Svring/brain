"use client";

import React, { useState } from "react";
import { Cpu, CpuIcon, MemoryStick, MemoryStickIcon } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { MonitorChart } from "../../../components/monitor-chart";
import { Button } from "@/components/ui/button";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { useDevboxUpdate } from "@/hooks/sealos/devbox/use-devbox-update";
import { useChatActions } from "@/contexts/chat/chat-context";

interface CpuMemorySectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// CPU/Memory Popover Content Component
export const CpuMemoryPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: devboxObject } = useResourceStatus(target);
  const { latestData, isLoading: isMetricsLoading } = useResourceMetricsStatus({
    target,
  });

  // Get real-time usage from metrics
  const cpuUsage = latestData?.cpu || 0;
  const memoryUsage = latestData?.memory || 0;

  // Get resource limits from devbox object
  const cpuLimit = devboxObject?.resources?.cpu || 0;
  const memoryLimit = devboxObject?.resources?.memory || 0;

  // Update devbox using the custom hook
  const { updateDevbox, isLoading: isUpdating } = useDevboxUpdate({
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const handleFormSubmit = async (data: DevboxUpdateFormData) => {
    try {
      await updateDevbox({
        name: devboxObject?.name || target.name!,
        resource: data.resource,
      });
    } catch (error) {
      console.error("Error updating devbox resources:", error);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full rounded-lg space-y-3">
        <DevboxUpdateForm
          key={`resource-edit-${target.name}`}
          defaultValues={{
            name: devboxObject?.name || target.name!,
            resource: {
              cpu: cpuLimit,
              memory: memoryLimit,
            },
          }}
          onSubmit={handleFormSubmit}
          isLoading={isUpdating}
          hideDefaultButton={true}
          hidePorts={true}
        />

        {/* Cancel and Confirm Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setIsEditing(false);
              //triggerScrollToBottom();
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="devbox-update-form"
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
          onClick={() => {
            setIsEditing(true);
            //triggerScrollToBottom();
          }}
        >
          Edit Resources
        </Button>
      </div>
    </div>
  );
};

export const CpuMemorySection: React.FC<CpuMemorySectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: devboxObject } = useResourceStatus(target);
  const { latestData, isLoading: isMetricsLoading } = useResourceMetricsStatus({
    target,
  });

  // Get real-time usage from metrics
  const cpuUsage = latestData?.cpu || 0;
  const memoryUsage = latestData?.memory || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex gap-2">
        {/* CPU */}
        <div className="flex-1 flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">CPU</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Usage</span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: "hsl(var(--chart-1))" }}
              >
                {isMetricsLoading ? "..." : `${cpuUsage.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className="flex-1 flex items-center gap-2">
          <MemoryStick
            className="h-5 w-5"
            style={{ color: "hsl(var(--chart-2))" }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Memory</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Usage</span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: "hsl(var(--chart-2))" }}
              >
                {isMetricsLoading ? "..." : `${memoryUsage.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpuMemorySection;
