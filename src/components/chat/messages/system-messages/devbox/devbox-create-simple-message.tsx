"use client";

import React from "react";
import { DevboxCreateSimpleForm } from "@/components/forms/devbox/devbox-create-form-simple";
import { DevboxSimpleFormData } from "@/components/forms/devbox/devbox-create-form-simple";
import { useDevboxCreate } from "@/hooks/sealos/devbox/use-devbox-create";

interface DevboxCreateSimpleMessageProps {
  onSuccess?: () => void;
}

export const DevboxCreateSimpleMessage: React.FC<DevboxCreateSimpleMessageProps> = ({
  onSuccess,
}) => {
  const { createDevbox, isLoading } = useDevboxCreate({ addToProject: true, onSuccess });

  return (
    <div className="space-y-3 flex-col p-3 rounded-xl">
      <DevboxCreateSimpleForm
        onSubmit={createDevbox}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DevboxCreateSimpleMessage;
