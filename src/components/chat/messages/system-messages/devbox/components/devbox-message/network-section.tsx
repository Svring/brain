"use client";

import React, { useState, useMemo } from "react";
import { Network } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { PortDisplayTable } from "../../../components/port-display-table";
import { Button } from "@/components/ui/button";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { useDevboxUpdate } from "@/hooks/sealos/devbox/use-devbox-update";
import { useChatActions } from "@/contexts/chat/chat-context";

interface NetworkSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Network Popover Content Component
export const NetworkPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: devboxObject } = useResourceStatus(target);

  // Update devbox using the custom hook
  const { updateDevbox, isLoading: isUpdating } = useDevboxUpdate({
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const handleFormSubmit = async (data: DevboxUpdateFormData) => {
    try {
      await updateDevbox({
        name: devboxObject?.name || target.name!,
        ports: data.ports,
      });
    } catch (error) {
      console.error("Error updating devbox ports:", error);
    }
  };

  // Transform devbox ports to PortDisplayTable format
  const transformedPorts =
    devboxObject?.ports?.map((port: any) => ({
      number: port.number || 0,
      privateAddress:
        port.privateAddress || port.privateHost || port.serviceName,
      publicAddress:
        port.publicAddress ||
        port.publicDomain ||
        port.customDomain ||
        port.domain,
      protocol: port.protocol,
      name: port.portName,
      serviceName: port.serviceName,
      host: port.host,
    })) || [];

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(
    () => (
      <DevboxUpdateForm
        key={`network-edit-${target.name}`}
        defaultValues={{
          name: devboxObject?.name || target.name!,
          ports:
            devboxObject?.ports?.map((port: any) => ({
              portName: port.portName,
              number: port.number,
              protocol: (port.protocol as "HTTP" | "GRPC" | "WS") || "HTTP",
              exposesPublicDomain: !!port.publicAddress,
              customDomain: port.host,
            })) || [],
        }}
        onSubmit={handleFormSubmit}
        isLoading={isUpdating}
        hideDefaultButton={true}
      />
    ),
    [devboxObject?.name, devboxObject?.ports, target.name, isUpdating]
  );

  if (isEditing) {
    return (
      <div className="w-full rounded-lg min-w-0">
        <div className="space-y-3 min-w-0">{formContent}</div>

        {/* Cancel and Confirm Buttons - Fixed at bottom */}
        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-0"
            onClick={() => {
              setIsEditing(false);
              //triggerScrollToBottom();
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="devbox-update-form"
            variant="default"
            size="sm"
            className="flex-1 min-w-0"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg min-w-0 max-h-[250px] flex flex-col">
      {/* Scrollable Table Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="min-w-0">
          <PortDisplayTable ports={transformedPorts} target={target} />
        </div>
      </div>

      {/* Fixed Edit Button at Bottom */}
      <div className="w-full flex pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-0"
          onClick={() => {
            setIsEditing(true);
            //triggerScrollToBottom();
          }}
        >
          Edit Ports
        </Button>
      </div>
    </div>
  );
};

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: devboxObject } = useResourceStatus(target);
  const portsCount = devboxObject?.ports?.length || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors w-full min-w-0 flex-shrink-0"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2 min-w-0 w-full">
        <Network className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-sm truncate">Network</span>
          <span className="text-xs text-muted-foreground truncate">
            {portsCount} port{portsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkSection;
