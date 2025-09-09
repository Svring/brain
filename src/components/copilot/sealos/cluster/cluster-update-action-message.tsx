"use client";

import React from "react";
import { ClusterUpdateForm } from "@/components/forms/cluster/cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { useClusterUpdate } from "@/hooks/sealos/cluster/use-cluster-update";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Database, CircleCheckBigIcon } from "lucide-react";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useQuery } from "@tanstack/react-query";

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
  args: {
    clusterName: string;
    [key: string]: any;
  };
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
}

export const ClusterUpdateActionMessage: React.FC<
  ClusterUpdateActionMessageProps
> = ({ args, respond, status }) => {
  const { cluster } = useTRPCClients();
  const target = convertResourceTypeToTarget("cluster", args.clusterName);

  // Fetch existing cluster object
  const { data: existingCluster, isLoading: isLoadingCluster } = useQuery(
    cluster.get.queryOptions(target as any) as any
  );

  const { updateCluster, isLoading } = useClusterUpdate({
    onSuccess: () => {
      respond?.(`Cluster "${args.clusterName}" updated successfully`);
    },
    onError: () => {
      respond?.("Failed to update cluster");
    },
  });

  const handleSubmit = async (data: ClusterUpdateFormData) => {
    try {
      await updateCluster(args.clusterName, data);
    } catch (error) {
      console.error("Failed to update cluster:", error);
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <ClusterUpdateSuccessMessage args={args} />;
  }

  // Extract update data from args (excluding clusterName)
  const { clusterName, resource, ...updateRest } = args as any;

  // Build defaultValues for the update form
  const defaultValues: Partial<ClusterUpdateFormData> | undefined =
    existingCluster
      ? {
          resource,
          ...updateRest,
        }
      : undefined;

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Database,
        name: "Update Cluster",
      }}
      formId="cluster-update-form"
      isSubmitting={status === "inProgress" || isLoading || isLoadingCluster}
    >
      {isLoadingCluster ? (
        <div className="w-full p-4">
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Spinner variant="circle" size={32} />
              <p className="text-sm text-muted-foreground text-center">
                Loading current cluster configuration...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ClusterUpdateForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={status === "inProgress" || isLoading}
          hideDefaultButton={true}
        />
      )}
    </BaseActionMessage>
  );
};
