"use client";

import React from "react";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import BaseResourceIcon from "@/components/chat/messages/system-messages.tsx/components/base-resource-icon";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useDevboxLifecycle } from "@/hooks/sealos/devbox/use-devbox-lifecycle";
import {
  Play,
  Pause,
  RotateCcw,
  Power,
  Trash2,
  CircleCheckBigIcon,
} from "lucide-react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import NodeStatusLight from "@/components/flowgraph/node/components/node-status-light";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Button } from "@/components/ui/button";

interface DevboxLifecycleActionMessageProps {
  args: {
    devboxName: string;
  };
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
  action: "start" | "pause" | "restart" | "shutdown" | "delete";
}

const getActionConfig = (action: string) => {
  switch (action) {
    case "start":
      return {
        icon: Play,
        name: "Start Devbox",
        actionText: "Start the devbox",
        successMessage: "Devbox started successfully",
        errorMessage: "Failed to start devbox",
      };
    case "pause":
      return {
        icon: Pause,
        name: "Pause Devbox",
        actionText: "Pause the devbox",
        successMessage: "Devbox paused successfully",
        errorMessage: "Failed to pause devbox",
      };
    case "restart":
      return {
        icon: RotateCcw,
        name: "Restart Devbox",
        actionText: "Restart the devbox",
        successMessage: "Devbox restarted successfully",
        errorMessage: "Failed to restart devbox",
      };
    case "shutdown":
      return {
        icon: Power,
        name: "Shutdown Devbox",
        actionText: "Shutdown the devbox",
        successMessage: "Devbox shutdown successfully",
        errorMessage: "Failed to shutdown devbox",
      };
    case "delete":
      return {
        icon: Trash2,
        name: "Delete Devbox",
        actionText: "Delete the devbox",
        successMessage: "Devbox deleted successfully",
        errorMessage: "Failed to delete devbox",
      };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};

// Component that handles the success message
const DevboxLifecycleSuccessMessage = ({
  args,
  action,
}: {
  args: { devboxName: string };
  action: string;
}) => {
  const target = convertResourceTypeToTarget("devbox", args.devboxName);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "devbox.detail",
  });
  const config = getActionConfig(action);

  return (
    <div className="w-full bg-background-secondary">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">{config.successMessage}</p>
        </div>
        <Button onClick={() => handleNodeSelect()} variant="outline" size="sm">
          View devbox details
        </Button>
      </div>
    </div>
  );
};

export const DevboxLifecycleActionMessage: React.FC<
  DevboxLifecycleActionMessageProps
> = ({ args, respond, status, action }) => {
  const target = convertResourceTypeToTarget("devbox", args.devboxName);
  const config = getActionConfig(action);
  const { resource } = useResourceStatus(target);

  const { executeAction, getMutationForAction, isPending } = useDevboxLifecycle(
    {
      onSuccess: (message) => respond?.(message),
      onError: (message) => respond?.(message),
    }
  );

  // Show completion message when status is complete
  if (status === "complete") {
    return <DevboxLifecycleSuccessMessage args={args} action={action} />;
  }

  const mutation = getMutationForAction(action);

  const handleSubmit = async () => {
    await executeAction(action, args.devboxName);
  };

  return (
    <BaseActionMessage
      headerTitle={{
        icon: config.icon,
        name: config.name,
      }}
      formId={`devbox-${action}-form`}
      isSubmitting={status === "inProgress" || isPending(action)}
      onApply={handleSubmit}
      applyButtonText={config.name}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 ">
          <BaseResourceIcon target={target} size={32} />
          <div className="flex-1">
            <span className="text-lg font-medium">{args.devboxName}</span>
          </div>
          <NodeStatusLight status={resource?.status || "Pending"} />
        </div>
      </div>
    </BaseActionMessage>
  );
};
