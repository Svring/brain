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

    const updateRequest = { name: target.name!, ...data };

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


  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors w-full min-w-0"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Settings className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Advanced</span>
          <span className="text-xs text-muted-foreground">
            configuration
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConfigSection;
