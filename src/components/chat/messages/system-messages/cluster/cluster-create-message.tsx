"use client";

import React from "react";
import { ClusterCreateForm } from "@/components/forms/cluster/cluster-create-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { useClusterCreate } from "@/hooks/sealos/cluster/use-cluster-create";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

interface ClusterCreateMessageProps {
  payload?: Partial<ClusterCreateFormData>;
  addToProject?: boolean;
}

export const ClusterCreateMessage: React.FC<ClusterCreateMessageProps> = ({
  payload,
  addToProject = true,
}) => {
  const { createCluster, isLoading } = useClusterCreate({ addToProject });
  const { checkAndShowQuotaError } = useResourceQuotaChecker();

  const handleSubmit = async (data: ClusterCreateFormData) => {
    const quotaCheckPassed = checkAndShowQuotaError({
      cpu: data.resource?.cpu || 0.5, 
      memory: data.resource?.memory || 0.5, 
      storage: data.resource?.storage || 1, 
    });
    
    if (!quotaCheckPassed) {
      return; 
    }

    await createCluster(data);
  };

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <ClusterCreateForm
        defaultValues={payload}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ClusterCreateMessage;
