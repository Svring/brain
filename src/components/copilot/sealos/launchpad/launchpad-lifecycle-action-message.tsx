"use client";

import React from "react";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import BaseResourceIcon from "@/components/chat/messages/system-messages.tsx/components/base-resource-icon";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Play, Pause, CircleCheckBigIcon } from "lucide-react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import NodeStatusLight from "@/components/flowgraph/node/components/node-status-light";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Button } from "@/components/ui/button";

interface LaunchpadLifecycleActionMessageProps {
  args: {
    launchpadName: string;
  };
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
  action: "start" | "pause";
}

const getActionConfig = (action: string) => {
  switch (action) {
    case "start":
      return {
        icon: Play,
        name: "Start Launchpad",
        actionText: "Start the launchpad",
        successMessage: "Launchpad started successfully",
        errorMessage: "Failed to start launchpad",
      };
    case "pause":
      return {
        icon: Pause,
        name: "Pause Launchpad",
        actionText: "Pause the launchpad",
        successMessage: "Launchpad paused successfully",
        errorMessage: "Failed to pause launchpad",
      };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};

// Component that handles the success message
const LaunchpadLifecycleSuccessMessage = ({ 
  args, 
  action 
}: { 
  args: { launchpadName: string }; 
  action: string;
}) => {
  const target = convertResourceTypeToTarget("deployment", args.launchpadName);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "launchpad.detail",
  });
  const config = getActionConfig(action);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">{config.successMessage}</p>
        </div>
        <Button onClick={handleNodeSelect} variant="outline" size="sm">
          View launchpad details
        </Button>
      </div>
    </div>
  );
};

export const LaunchpadLifecycleActionMessage: React.FC<
  LaunchpadLifecycleActionMessageProps
> = ({ args, respond, status, action }) => {
  const { launchpad } = useTRPCClients();
  const target = convertResourceTypeToTarget("deployment", args.launchpadName);
  const config = getActionConfig(action);
  const { resource } = useResourceStatus(target);

  // Show completion message when status is complete
  if (status === "complete") {
    return <LaunchpadLifecycleSuccessMessage args={args} action={action} />;
  }

  const mutation = useMutation({
    ...(() => {
      switch (action) {
        case "start":
          return launchpad.start.mutationOptions();
        case "pause":
          return launchpad.pause.mutationOptions();
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    })(),
    onSuccess: () => {
      toast.success(config.successMessage);
      respond?.(config.successMessage);
    },
    onError: (error: any) => {
      toast.error(error.message || config.errorMessage);
      respond?.(config.errorMessage);
    },
  });

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync(args.launchpadName);
    } catch (error) {
      console.error(`Failed to ${action} launchpad:`, error);
    }
  };

  return (
    <BaseActionMessage
      headerTitle={{
        icon: config.icon,
        name: config.name,
      }}
      formId={`launchpad-${action}-form`}
      isSubmitting={status === "inProgress" || mutation.isPending}
      onApply={handleSubmit}
      applyButtonText={config.name}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <BaseResourceIcon target={target} size={32} />
          <div className="flex-1">
            <span className="text-lg font-medium">{args.launchpadName}</span>
          </div>
          <NodeStatusLight status={resource?.status || "Pending"} />
        </div>
      </div>
    </BaseActionMessage>
  );
};
