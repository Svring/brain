"use client";

import React from "react";
import { Cpu, MemoryStick } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { ResourceQuota } from "../launchpad-message-detail/resource-quota";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

interface ResourceQuotaSectionProps {
  target: BuiltinResourceTarget;
  onSectionClick: () => void;
}

// Resource Quota Popover Content Component
export const ResourceQuotaPopoverContent: React.FC<{
  target: BuiltinResourceTarget;
}> = ({ target }) => {
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const queryClient = useQueryClient();
  const { launchpad } = useTRPCClients();
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  const updateLaunchpad = useMutation(launchpad.update.mutationOptions());

  const handleSubmit = async (type: string, data?: any) => {
    setUpdatingField(type);

    const updateRequest = { name: target.name!, request: data };

    await updateLaunchpad.mutateAsync(updateRequest, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: launchpad.get.queryKey(target),
        });
        toast.success("Launchpad updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update launchpad");
      },
      onSettled: () => {
        setUpdatingField(null);
      },
    });
  };

  return (
    <div className="w-full rounded-lg">
      <ResourceQuota
        resource={parsedLaunchpadObject?.resource}
        onResourceUpdate={handleSubmit}
        isLoading={updatingField === "resource"}
      />
    </div>
  );
};

export const ResourceQuotaSection: React.FC<ResourceQuotaSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const cpuValue = parsedLaunchpadObject?.resource?.cpu || 0;
  const memoryValue = parsedLaunchpadObject?.resource?.memory || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex gap-2">
        {/* CPU */}
        <div className="flex-1 flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">CPU</span>
            <span className="text-xs text-muted-foreground">
              {cpuValue ? `${cpuValue}Core` : "N/A"}
            </span>
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
            <span className="text-xs text-muted-foreground">
              {memoryValue ? `${memoryValue}GB` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceQuotaSection;
