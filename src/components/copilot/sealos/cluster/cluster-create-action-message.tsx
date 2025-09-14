"use client";

import React from "react";
import { ClusterCreateForm } from "@/components/forms/cluster/cluster-create-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { useClusterCreate } from "@/hooks/sealos/cluster/use-cluster-create";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Database, CircleCheckBigIcon } from "lucide-react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Button } from "@/components/ui/button";

// Component that handles the success message and system message appending
const ClusterCreationSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("cluster", args.name);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "cluster.detail",
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Cluster created successfully</p>
        </div>
        <Button onClick={handleNodeSelect} variant="outline" size="sm">
          View cluster details
        </Button>
      </div>
    </div>
  );
};

interface ClusterCreateActionMessageProps {
  args: Partial<ClusterCreateFormData>;
  respond?: (message: string) => void;
}

export const ClusterCreateActionMessage: React.FC<ClusterCreateActionMessageProps> = ({
  args,
  respond,
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

  // Show completion message when args are provided (tool result display)
  if (args && Object.keys(args).length > 0) {
    return <ClusterCreationSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Database,
        name: "Create Cluster",
      }}
      formId="cluster-create-form"
      isSubmitting={isLoading}
    >
      <ClusterCreateForm
        defaultValues={args}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        hideDefaultButton={true}
      />
    </BaseActionMessage>
  );
};
