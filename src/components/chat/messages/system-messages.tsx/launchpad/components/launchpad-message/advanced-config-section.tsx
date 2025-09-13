"use client";

import React from "react";
import { Settings } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { Configuration } from "../launchpad-message-detail/configuration";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

interface AdvancedConfigSectionProps {
  target: BuiltinResourceTarget;
  onSectionClick: () => void;
}

// Advanced Configuration Popover Content Component
export const AdvancedConfigPopoverContent: React.FC<{
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
      <Configuration
        command={parsedLaunchpadObject?.launchCommand?.command?.join(" ")}
        args={parsedLaunchpadObject?.launchCommand?.args?.join(" ")}
        envVars={parsedLaunchpadObject?.env || []}
        configMap={parsedLaunchpadObject?.configMap}
        storage={
          parsedLaunchpadObject?.kind === "StatefulSet"
            ? parsedLaunchpadObject.localStorage
            : undefined
        }
        onConfigUpdate={handleSubmit}
        isLoading={updatingField === "config"}
      />
    </div>
  );
};

export const AdvancedConfigSection: React.FC<AdvancedConfigSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  // Count configuration items
  const commandCount = parsedLaunchpadObject?.launchCommand?.command?.length || 0;
  const argsCount = parsedLaunchpadObject?.launchCommand?.args?.length || 0;
  const envCount = parsedLaunchpadObject?.env?.length || 0;
  const configMapCount = parsedLaunchpadObject?.configMap?.length || 0;
  const storageCount = parsedLaunchpadObject?.localStorage?.length || 0;

  const totalConfigItems = commandCount + argsCount + envCount + configMapCount + storageCount;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Advanced Config</span>
          <span className="text-xs text-muted-foreground">
            {totalConfigItems} item{totalConfigItems !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConfigSection;
