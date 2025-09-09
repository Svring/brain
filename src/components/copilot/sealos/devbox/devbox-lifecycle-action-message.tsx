"use client";

import React from "react";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import BaseResourceMessageHeader from "@/components/chat/messages/system-messages.tsx/components/base-resourec-message-header";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Power, Trash2 } from "lucide-react";

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

export const DevboxLifecycleActionMessage: React.FC<
  DevboxLifecycleActionMessageProps
> = ({ args, respond, status, action }) => {
  const { devbox } = useTRPCClients();
  const target = convertResourceTypeToTarget("devbox", args.devboxName);
  const config = getActionConfig(action);

  const mutation = useMutation({
    mutationFn: async () => {
      switch (action) {
        case "start":
          return await devbox.start.mutateAsync(args.devboxName);
        case "pause":
          return await devbox.pause.mutateAsync(args.devboxName);
        case "restart":
          return await devbox.restart.mutateAsync(args.devboxName);
        case "shutdown":
          return await devbox.shutdown.mutateAsync(args.devboxName);
        case "delete":
          return await devbox.delete.mutateAsync(args.devboxName);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
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
      await mutation.mutateAsync();
    } catch (error) {
      console.error(`Failed to ${action} devbox:`, error);
    }
  };

  // Auto-submit when component mounts if status is executing
  React.useEffect(() => {
    if (status === "executing" && !mutation.isPending && !mutation.isSuccess) {
      handleSubmit();
    }
  }, [status]);

  return (
    <BaseActionMessage
      headerTitle={{
        icon: config.icon,
        name: config.name,
      }}
      formId={`devbox-${action}-form`}
      isSubmitting={status === "inProgress" || mutation.isPending}
      onApply={handleSubmit}
      applyButtonText={config.name}
    >
      <div className="space-y-4">
        <BaseResourceMessageHeader target={target} />
        <div className="px-4 py-2">
          <p className="text-sm text-muted-foreground">
            {config.actionText}
          </p>
        </div>
      </div>
    </BaseActionMessage>
  );
};
