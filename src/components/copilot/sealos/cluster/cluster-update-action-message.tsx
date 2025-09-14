"use client";

import React from "react";
import { ClusterUpdateForm } from "@/components/forms/cluster/cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { useClusterUpdate } from "@/hooks/sealos/cluster/use-cluster-update";
import BaseActionMessage from "@/components/chat/messages/system-messages/components/base-action-message";
import { Database } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useQuery } from "@tanstack/react-query";

interface ClusterUpdateActionMessageProps {
  args: Partial<ClusterUpdateFormData> & { clusterName: string };
  respond?: (message: string) => void;
}

export const ClusterUpdateActionMessage: React.FC<
  ClusterUpdateActionMessageProps
> = ({ args, respond }) => {
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
      await updateCluster(data);
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
