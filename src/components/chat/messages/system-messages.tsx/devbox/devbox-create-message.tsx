"use client";

import React from "react";
import { DevboxCreateForm } from "@/components/forms/devbox/devbox-create-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { useDevboxCreate } from "@/hooks/sealos/devbox/use-devbox-create";

interface DevboxCreateMessageProps {
  payload?: Partial<DevboxCreateFormData>;
  addToProject?: boolean;
}

export const DevboxCreateMessage: React.FC<DevboxCreateMessageProps> = ({
  payload,
  addToProject = true,
}) => {
  const { createDevbox, isLoading } = useDevboxCreate({ addToProject });

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <DevboxCreateForm
        defaultValues={payload}
        onSubmit={createDevbox}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DevboxCreateMessage;
