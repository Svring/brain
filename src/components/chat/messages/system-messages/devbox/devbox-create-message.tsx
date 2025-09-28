"use client";

import React from "react";
import { DevboxCreateForm } from "@/components/forms/devbox/devbox-create-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { useDevboxCreate } from "@/hooks/sealos/devbox/use-devbox-create";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

interface DevboxCreateMessageProps {
  payload?: Partial<DevboxCreateFormData>;
  addToProject?: boolean;
}

export const DevboxCreateMessage: React.FC<DevboxCreateMessageProps> = ({
  payload,
  addToProject = true,
}) => {
  const { createDevbox, isLoading } = useDevboxCreate({ addToProject });
  const { checkAndShowQuotaError } = useResourceQuotaChecker();

  const handleSubmit = async (data: DevboxCreateFormData) => {
    const quotaCheckPassed = checkAndShowQuotaError({
      cpu: data.resource?.cpu || 2, 
      memory: data.resource?.memory || 4, 
      ports: data.ports?.length || 0, 
    });
    
    if (!quotaCheckPassed) {
      return; 
    }

    await createDevbox(data);
  };

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <DevboxCreateForm
        defaultValues={payload}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DevboxCreateMessage;
