"use client";

import React from "react";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import BaseResourceIcon from "@/components/chat/messages/system-messages.tsx/components/base-resource-icon";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";
import { Play, Pause, CircleCheckBigIcon } from "lucide-react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import NodeStatusLight from "@/components/flowgraph/node/components/node-status-light";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Button } from "@/components/ui/button";

interface ClusterLifecycleActionMessageProps {
  args: {
    clusterName: string;
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
        name: "Start Cluster",
        actionText: "Start the cluster",
        successMessage: "Cluster started successfully",
        errorMessage: "Failed to start cluster",
      };
    case "pause":
      return {
        icon: Pause,
        name: "Pause Cluster",
        actionText: "Pause the cluster",
        successMessage: "Cluster paused successfully",
        errorMessage: "Failed to pause cluster",
      };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};

// Component that handles the success message
const ClusterLifecycleSuccessMessage = ({ 
  args, 
  action 
}: { 
  args: { clusterName: string }; 
  action: string;
}) => {
  const target = convertResourceTypeToTarget("cluster", args.clusterName);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "cluster.detail",
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
          View cluster details
        </Button>
      </div>
    </div>
  );
};

export const ClusterLifecycleActionMessage: React.FC<
  ClusterLifecycleActionMessageProps
> = ({ args, respond, status, action }) => {
  const target = convertResourceTypeToTarget("cluster", args.clusterName);
  const config = getActionConfig(action);
  const { resource } = useResourceStatus(target);

  const { executeAction, getMutationForAction, isPending } = useClusterLifecycle({
    onSuccess: (message) => respond?.(message),
    onError: (message) => respond?.(message),
  });

  // Show completion message when status is complete
  if (status === "complete") {
    return <ClusterLifecycleSuccessMessage args={args} action={action} />;
  }

  const mutation = getMutationForAction(action);

  const handleSubmit = async () => {
    await executeAction(action, args.clusterName);
  };

  return (
    <BaseActionMessage
      headerTitle={{
        icon: config.icon,
        name: config.name,
      }}
      formId={`cluster-${action}-form`}
      isSubmitting={status === "inProgress" || isPending(action)}
      onApply={handleSubmit}
      applyButtonText={config.name}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <BaseResourceIcon target={target} size={32} />
          <div className="flex-1">
            <span className="text-lg font-medium">{args.clusterName}</span>
          </div>
          <NodeStatusLight status={resource?.status || "Pending"} />
        </div>
      </div>
    </BaseActionMessage>
  );
};
