"use client";

import React from "react";
import { ClusterUpdateForm } from "@/components/forms/cluster/cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { useClusterUpdate } from "@/hooks/sealos/cluster/use-cluster-update";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Database, CircleCheckBigIcon } from "lucide-react";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Button } from "@/components/ui/button";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// Component that handles the success message and system message appending
const ClusterUpdateSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("cluster", args.clusterName);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "cluster.detail",
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Cluster updated successfully</p>
        </div>
        <Button onClick={handleNodeSelect} variant="outline" size="sm">
          View cluster details
        </Button>
      </div>
    </div>
  );
};

interface ClusterUpdateActionMessageProps {
  args: Partial<ClusterUpdateFormData> & { clusterName: string };
  respond?: (message: string) => void;
  status: "executing" | "inProgress" | "complete";
}

export const ClusterUpdateActionMessage: React.FC<
  ClusterUpdateActionMessageProps
> = ({ args, respond, status }) => {
  const { clusterName, ...formData } = args;

  const { updateCluster, isLoading } = useClusterUpdate({
    onSuccess: () => {
      respond?.(`Cluster "${clusterName}" updated successfully`);
    },
    onError: () => {
      respond?.("Failed to update cluster");
    },
  });

  const handleSubmit = async (data: ClusterUpdateFormData) => {
    try {
      console.log("Updating cluster", data);
      await updateCluster(clusterName, data);
    } catch (error) {
      console.error("Failed to update cluster:", error);
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <ClusterUpdateSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Database,
        name: "Update Cluster",
      }}
      formId="cluster-update-form"
      isSubmitting={status === "inProgress" || isLoading}
      disabled={status === "inProgress" || isLoading}
      applyButtonText="Update"
      className="bg-background-primary"
    >
      <ClusterUpdateForm
        defaultValues={formData}
        onSubmit={handleSubmit}
        isLoading={status === "inProgress" || isLoading}
        hideDefaultButton={true}
        formId="cluster-update-form"
      />
    </BaseActionMessage>
  );
};
