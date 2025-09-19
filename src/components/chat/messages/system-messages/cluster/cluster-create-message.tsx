"use client";

import React from "react";
import { ClusterCreateForm } from "@/components/forms/cluster/cluster-create-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { useClusterCreate } from "@/hooks/sealos/cluster/use-cluster-create";

interface ClusterCreateMessageProps {
  payload?: Partial<ClusterCreateFormData>;
  addToProject?: boolean;
}

export const ClusterCreateMessage: React.FC<ClusterCreateMessageProps> = ({
  payload,
  addToProject = true,
}) => {
  const { createCluster, isLoading } = useClusterCreate({ addToProject });

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <ClusterCreateForm
        defaultValues={payload}
        onSubmit={createCluster}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ClusterCreateMessage;
