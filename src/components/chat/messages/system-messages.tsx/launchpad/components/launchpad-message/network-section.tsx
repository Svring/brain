"use client";

import React, { useState, useMemo } from "react";
import { Network } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { PortDisplayTable } from "../../../components/port-display-table";
import { Button } from "@/components/ui/button";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface NetworkSectionProps {
  target: BuiltinResourceTarget;
  onSectionClick: () => void;
}

// Network Popover Content Component
export const NetworkPopoverContent: React.FC<{
  target: BuiltinResourceTarget;
}> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const queryClient = useQueryClient();
  const { launchpad } = useTRPCClients();

  const updateLaunchpad = useMutation(launchpad.update.mutationOptions());

  const launchpadPorts = parsedLaunchpadObject?.ports || [];
  const portsCount = launchpadPorts.length;

  // Transform launchpad ports to LaunchpadPortSchema format for the form
  const formPorts = launchpadPorts.map((port: any) => ({
    portName: port.portName || port.name || `port-${port.port || port.number}`,
    number: port.port || port.number || 0,
    protocol: (port.protocol as "HTTP" | "GRPC" | "WS") || "HTTP",
    exposesPublicDomain: !!port.publicAddress || !!port.publicDomain || !!port.customDomain || !!port.domain,
    customDomain: port.customDomain || port.domain,
  }));

  const handleFormSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      const updateRequest = { name: target.name!, request: data };
      await updateLaunchpad.mutateAsync(updateRequest, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.get.queryKey(target),
          });
          toast.success("Launchpad updated successfully!");
          setIsEditing(false);
        },
        onError: () => {
          toast.error("Failed to update launchpad");
        },
      });
    } catch (error) {
      console.error("Error updating launchpad ports:", error);
    }
  };

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(
    () => (
      <LaunchpadUpdateForm
        key={`network-edit-${target.name}`}
        defaultValues={{
          name: parsedLaunchpadObject?.name || target.name!,
          ports: formPorts,
        }}
        onSubmit={handleFormSubmit}
        isLoading={updateLaunchpad.isPending}
        hideDefaultButton={true}
      />
    ),
    [
      parsedLaunchpadObject?.name,
      formPorts,
      target.name,
      updateLaunchpad.isPending,
    ]
  );

  // Transform launchpad ports to PortDisplayTable format
  const transformedPorts = launchpadPorts.map((port: any) => ({
    number: port.port || port.number || 0,
    privateAddress: port.privateAddress || port.privateHost || port.serviceName,
    publicAddress: port.publicAddress || port.publicDomain || port.customDomain || port.domain,
    protocol: port.protocol,
    name: port.portName,
    serviceName: port.serviceName,
    host: port.host,
  }));

  if (isEditing) {
    return (
      <div className="w-full rounded-lg">
        <div className="space-y-3">{formContent}</div>

        {/* Cancel and Confirm Buttons - Fixed at bottom */}
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsEditing(false)}
            disabled={updateLaunchpad.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="launchpad-update-form"
            variant="default"
            size="sm"
            className="flex-1"
            disabled={updateLaunchpad.isPending}
          >
            {updateLaunchpad.isPending ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg space-y-3">
      <PortDisplayTable ports={transformedPorts} />

      {/* Edit Button - Full Row */}
      <div className="w-full">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsEditing(true)}
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
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const portsCount = parsedLaunchpadObject?.ports?.length || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Network</span>
          <span className="text-xs text-muted-foreground">
            {portsCount} port{portsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkSection;
