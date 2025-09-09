"use client";

import React from "react";
import { DevboxCreateForm } from "@/components/forms/devbox/devbox-create-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { useDevboxCreate } from "@/hooks/sealos/devbox/use-devbox-create";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Code, CircleCheckBigIcon } from "lucide-react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

// Component that handles the success message and system message appending
const DevboxCreationSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("devbox", args.name);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "devbox.detail",
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Devbox created successfully</p>
        </div>
        <Button onClick={handleNodeSelect} variant="outline" size="sm">
          View devbox details
        </Button>
      </div>
    </div>
  );
};

interface DevboxCreateActionMessageProps {
  args: Partial<DevboxCreateFormData>;
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
}

export const DevboxCreateActionMessage: React.FC<
  DevboxCreateActionMessageProps
> = ({ args, respond, status }) => {
  const { createDevbox, isLoading } = useDevboxCreate({ addToProject: true });

  const handleSubmit = async (data: DevboxCreateFormData) => {
    try {
      await createDevbox(data);
      respond?.(`Devbox "${data.name}" created successfully`);
    } catch (error) {
      console.error("Failed to create devbox:", error);
      respond?.("Failed to create devbox");
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <DevboxCreationSuccessMessage args={args} />;
  }

  // Show spinner when status is executing
  // if (status === "executing") {
  //   return (
  //     <div className="w-full p-4">
  //       <div className="flex items-center justify-center p-8">
  //         <div className="flex flex-col items-center gap-4">
  //           <Spinner variant="circle" size={32} />
  //           <p className="text-sm text-muted-foreground text-center">
  //             Creating devbox...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Code,
        name: "Create Devbox",
      }}
      formId="devbox-create-form"
      isSubmitting={status === "inProgress" || isLoading}
    >
      <DevboxCreateForm
        defaultValues={args}
        onSubmit={handleSubmit}
        isLoading={status === "inProgress" || isLoading}
        hideDefaultButton={true}
      />
    </BaseActionMessage>
  );
};
