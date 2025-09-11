"use client";

import React from "react";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { useDevboxUpdate } from "@/hooks/sealos/devbox/use-devbox-update";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { Code, Check, CircleCheckBigIcon } from "lucide-react";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { convertSimplePortOpsToFormPorts } from "@/lib/copilot/sealos/devbox/copilot-devbox-utils";
import { useQuery } from "@tanstack/react-query";
import { Cpu, MemoryStick } from "lucide-react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

// Component to display current devbox resource information
const DevboxResourceDisplay = ({ resource }: { resource?: DevboxObject['resources'] }) => {
  if (!resource) return null;

  return (
    <div className="border border-dashed rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">Current Resource Configuration</h3>
      </div>
      <div className="flex items-center justify-around">
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-muted-foreground">CPU</div>
          <div className="text-sm font-medium">
            {resource?.cpu ? `${resource.cpu}Core` : "N/A"}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-muted-foreground">Memory</div>
          <div className="text-sm font-medium">
            {resource?.memory ? `${resource.memory}GB` : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component that handles the success message and system message appending
const DevboxUpdateSuccessMessage = ({ args }: { args: any }) => {
  const target = convertResourceTypeToTarget("devbox", args.devboxName);
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "devbox.detail",
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Devbox updated successfully</p>
        </div>
        <Button onClick={handleNodeSelect} variant="outline" size="sm">
          View devbox details
        </Button>
      </div>
    </div>
  );
};

interface DevboxUpdateActionMessageProps {
  args: {
    devboxName: string;
    [key: string]: any;
  };
  respond?: (message: string) => void;
  status: "inProgress" | "complete" | "executing";
}

export const DevboxUpdateActionMessage: React.FC<
  DevboxUpdateActionMessageProps
> = ({ args, respond, status }) => {
  const { devbox } = useTRPCClients();
  const target = convertResourceTypeToTarget("devbox", args.devboxName);

  // Fetch existing devbox object (to get current ports)
  const { data: existingDevbox, isLoading: isLoadingDevbox } = useQuery(
    devbox.get.queryOptions(target as any) as any
  ) as { data: DevboxObject | undefined; isLoading: boolean };

  const { updateDevbox, isLoading } = useDevboxUpdate({
    onSuccess: () => {
      respond?.(`Devbox "${args.devboxName}" updated successfully`);
    },
    onError: () => {
      respond?.("Failed to update devbox");
    },
  });

  const handleSubmit = async (data: DevboxUpdateFormData) => {
    try {
      await updateDevbox(args.devboxName, data);
    } catch (error) {
      console.error("Failed to update devbox:", error);
    }
  };

  // Show completion message when status is complete
  if (status === "complete") {
    return <DevboxUpdateSuccessMessage args={args} />;
  }

  // Extract update data from args (excluding devboxName)
  const {
    devboxName,
    ports: simplePortsBatch,
    resource,
    ...updateRest
  } = args as any;

  // Determine if we should use simple ports mode (when simple port operations are provided)
  const useSimplePortsMode = Boolean(simplePortsBatch?.payload?.length);

  // Build defaultValues for the update form
  const defaultValues: Partial<DevboxUpdateFormData> | undefined =
    existingDevbox
      ? useSimplePortsMode
        ? {
            resource,
            simplePorts: simplePortsBatch?.payload || [],
            ...updateRest,
          }
        : {
            resource,
            ports: convertSimplePortOpsToFormPorts(
              (existingDevbox as any)?.ports || [],
              simplePortsBatch?.payload
            ),
            ...updateRest,
          }
      : undefined;

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Code,
        name: "Update Devbox",
      }}
      formId="devbox-update-form"
      isSubmitting={status === "inProgress" || isLoading || isLoadingDevbox}
    >
      {isLoadingDevbox ? (
        <div className="w-full p-4">
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Spinner variant="circle" size={32} />
              <p className="text-sm text-muted-foreground text-center">
                Loading current devbox configuration...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Display current resource configuration */}
          <DevboxResourceDisplay resource={existingDevbox?.resources} />
          
          <DevboxUpdateForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={status === "inProgress" || isLoading}
            hideDefaultButton={true}
            useSimplePortsMode={useSimplePortsMode}
            hidePorts={true}
          />
        </div>
      )}
    </BaseActionMessage>
  );
};
