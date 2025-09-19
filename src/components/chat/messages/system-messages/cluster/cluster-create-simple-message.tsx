"use client";

import React from "react";
import { ClusterCreateSimpleForm } from "@/components/forms/cluster/cluster-create-form-simple";
import { ClusterSimpleFormData } from "@/components/forms/cluster/cluster-create-form-simple";
import { useClusterCreate } from "@/hooks/sealos/cluster/use-cluster-create";

interface ClusterCreateSimpleMessageProps {
  payload?: Partial<ClusterSimpleFormData>;
  onSuccess?: () => void;
  addToProject?: boolean;
}

export const ClusterCreateSimpleMessage: React.FC<
  ClusterCreateSimpleMessageProps
> = ({ payload, onSuccess, addToProject = true }) => {
  const { createCluster, isLoading } = useClusterCreate({ addToProject });

  const handleSubmit = async (data: ClusterSimpleFormData) => {
    try {
      await createCluster(data);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating cluster:", error);
    }
  };

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <ClusterCreateSimpleForm
        defaultValues={payload}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ClusterCreateSimpleMessage;
