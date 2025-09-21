"use client";

import React from "react";
import { ClusterCreateSimpleForm } from "@/components/forms/cluster/cluster-create-form-simple";
import { ClusterSimpleFormData } from "@/components/forms/cluster/cluster-create-form-simple";
import { useClusterCreate } from "@/hooks/sealos/cluster/use-cluster-create";

interface ClusterCreateSimpleMessageProps {
  onSuccess?: () => void;
}

export const ClusterCreateSimpleMessage: React.FC<
  ClusterCreateSimpleMessageProps
> = ({ onSuccess }) => {
  const { createCluster, isLoading } = useClusterCreate({ addToProject: true });

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
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ClusterCreateSimpleMessage;
