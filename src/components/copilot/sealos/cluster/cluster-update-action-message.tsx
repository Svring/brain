"use client";

import React from "react";
import { ClusterUpdateForm } from "@/components/forms/cluster/cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { useClusterUpdate } from "@/hooks/sealos/cluster/use-cluster-update";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Database, CircleCheckBigIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Button } from "@/components/ui/button";

// Component that handles the success message and system message appending
const ClusterUpdateSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("cluster", args.clusterName);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Cluster updated successfully</p>
        </div>
        <Button variant="outline" size="sm">
          View cluster details
        </Button>
      </div>
    </div>
  );
};

interface ClusterUpdateActionMessageProps {
  args: Partial<ClusterUpdateFormData> & { clusterName: string };
  result?: any;
  onSuccess?: (data: any) => void;
}

export const ClusterUpdateActionMessage: React.FC<
  ClusterUpdateActionMessageProps
> = ({ args, result, onSuccess }) => {
  const { updateCluster, isLoading } = useClusterUpdate();

  const handleSubmit = async (data: ClusterUpdateFormData) => {
    try {
      const result = await updateCluster(data);
      onSuccess?.("cluster updated Successfully");
    } catch (error) {
      console.error("Failed to update cluster:", error);
    }
  };

  // Extract update data from args (excluding clusterName)
  const { clusterName, resource, ...updateRest } = args as any;

  // Build defaultValues for the update form
  const defaultValues: Partial<ClusterUpdateFormData> | undefined = {
    name: args.clusterName,
    resource,
    ...updateRest,
  };

  // Show completion message when result is provided (tool result display)
  if (result) {
    return <ClusterUpdateSuccessMessage args={args} />;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Database,
        name: "Update Cluster",
      }}
      formId="cluster-update-form"
      isSubmitting={isLoading}
    >
      {isLoading ? (
        <div className="w-full p-4">
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Spinner variant="circle" size={32} />
              <p className="text-sm text-muted-foreground text-center">
                Updating...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ClusterUpdateForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          hideDefaultButton={true}
          formId="cluster-update-form"
        />
      )}
    </BaseActionMessage>
  );
};
