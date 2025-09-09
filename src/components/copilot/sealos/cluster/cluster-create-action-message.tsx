"use client";

import React from "react";
import { ClusterCreateForm } from "@/components/forms/cluster/cluster-create-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { useClusterCreate } from "@/hooks/sealos/cluster/use-cluster-create";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Database } from "lucide-react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";

// Component that handles the success message and system message appending
const ClusterCreationSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("cluster", args.name);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "cluster.detail",
  });

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            The cluster has been created successfully.
          </p>
          <button
            onClick={handleNodeSelect}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            View cluster details
          </button>
        </div>
      </div>
    </div>
  );
};

interface ClusterCreateActionMessageProps {
  args: Partial<ClusterCreateFormData>;
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
}

export const ClusterCreateActionMessage: React.FC<ClusterCreateActionMessageProps> = ({
  args,
  respond,
  status,
}) => {
  const { createCluster, isLoading } = useClusterCreate({ addToProject: true });

  const handleSubmit = async (data: ClusterCreateFormData) => {
    try {
      await createCluster(data);
      respond?.(`Cluster "${data.name}" created successfully`);
    } catch (error) {
      console.error("Failed to create cluster:", error);
      respond?.("Failed to create cluster");
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <ClusterCreationSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Database,
        name: "Create Cluster",
      }}
      formId="cluster-create-form"
      isSubmitting={status === "inProgress" || isLoading}
    >
      <ClusterCreateForm
        defaultValues={args}
        onSubmit={handleSubmit}
        isLoading={status === "inProgress" || isLoading}
        hideDefaultButton={true}
      />
    </BaseActionMessage>
  );
};
