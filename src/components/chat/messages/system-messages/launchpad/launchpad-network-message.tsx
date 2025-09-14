import React, { useState } from "react";
import { Globe, Check, X, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BaseSystemMessage from "../components/base-system-message";
import {
  LaunchpadObjectSchema,
  LaunchpadObject,
} from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

interface LaunchpadNetworkMessageProps {
  target: BuiltinResourceTarget;
}

export const LaunchpadNetworkMessage: React.FC<LaunchpadNetworkMessageProps> = ({
  target,
}) => {
  const { launchpad } = useTRPCClients();
  const queryClient = useQueryClient();
  const { resource } = useResourceStatus(target);
  const launchpadObject = resource ? LaunchpadObjectSchema.parse(resource) : null;
  const [isPortsEditing, setIsPortsEditing] = useState(false);

  const ports = launchpadObject?.ports || [];

  const { mutateAsync: updateLaunchpad, isPending: isUpdating } = useMutation({
    ...launchpad.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: launchpad.get.queryKey(target),
      });
      setIsPortsEditing(false);
    },
    onError: (error) => console.error("Failed to update launchpad ports:", error),
  });

  const handlePortsSubmit = async (data: LaunchpadUpdateFormData) => {
    await updateLaunchpad({
      name: target.name || "",
      request: data,
    });
  };

  if (!launchpadObject) return null;

  return (
    <BaseSystemMessage
      headerTitle={{ icon: Globe, name: "Launchpad Network Ports" }}
      headerSlot={
        isPortsEditing ? (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsPortsEditing(false)}
              disabled={isUpdating}
            >
              <X />
            </Button>
            <Button
              type="submit"
              form="launchpad-update-form"
              variant="outline"
              size="sm"
              className="h-8 w-8"
              // disabled={isUpdating}
            >
              {isUpdating ? (
                <Spinner variant="bars" className="h-4 w-4" />
              ) : (
                <Check />
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8"
            onClick={() => setIsPortsEditing(true)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Spinner variant="bars" className="h-4 w-4" />
            ) : (
              <PenLine />
            )}
          </Button>
        )
      }
    >
      {isPortsEditing ? (
        <LaunchpadUpdateForm
          defaultValues={{
            ports: ports.length > 0 
              ? ports.map((port) => ({
                  portName: port.name || `port-${port.number}`,
                  number: port.number,
                  protocol: (port.protocol as "HTTP" | "GRPC" | "WS") || "HTTP",
                  exposesPublicDomain: !!port.publicAddress,
                }))
              : [],
          }}
          onSubmit={handlePortsSubmit}
          isLoading={isUpdating}
          hideDefaultButton
        />
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-2">
          {ports.length > 0 ? (
            ports.map((port, index) => (
              <div key={`${port.number}-${index}`} className="border rounded-lg">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
                  <span className="text-sm font-medium">
                    Number: {port.number}
                  </span>
                  {port.protocol && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {port.protocol}
                    </span>
                  )}
                </div>
                {port.privateAddress && (
                  <div className="flex items-center gap-2 px-3 py-2 border-b">
                    <span className="text-xs text-muted-foreground">
                      Private:
                    </span>
                    <span className="text-xs font-mono">
                      {port.privateAddress}
                    </span>
                  </div>
                )}
                {port.publicAddress && (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Public:</span>
                    <span className="text-xs font-mono">
                      {port.publicAddress}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div 
              className="flex flex-col items-center justify-center py-4 text-center border border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsPortsEditing(true)}
            >
              <Globe className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                No ports configured
              </p>
              <p className="text-xs text-muted-foreground">
                Click here or edit button to add ports
              </p>
            </div>
          )}
        </div>
      )}
    </BaseSystemMessage>
  );
};

export default LaunchpadNetworkMessage;
