import React, { useState } from "react";
import { Globe, Plus, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import BaseActionMessage from "../components/base-action-message";
import { DevboxObjectSchema, DevboxPort } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { DevboxUpdateForm } from "@/components/forms/devbox/devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DevboxNetworkMessageProps {
  target: CustomResourceTarget;
}

export const DevboxNetworkMessage: React.FC<DevboxNetworkMessageProps> = ({
  target,
}) => {
  const { devbox } = useTRPCClients();
  const queryClient = useQueryClient();
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const { resource } = useResourceStatus(target);
  const devboxObject = DevboxObjectSchema.parse(resource);
  
  const [showPortForm, setShowPortForm] = useState(false);
  const [newPort, setNewPort] = useState({
    number: 8080,
    protocol: "HTTP" as "HTTP" | "GRPC" | "WS",
    exposesPublicDomain: true,
    customDomain: "",
  });

  const ports = devboxObject?.ports || [];

  const updateDevboxMutation = useMutation({
    ...devbox.updateDevbox.mutationOptions(),
    onSuccess: () => {
      // Invalidate devbox queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: devbox.getDevbox.queryKey(target),
      });
      setShowPortForm(false);
      setNewPort({
        number: 8080,
        protocol: "HTTP",
        exposesPublicDomain: true,
        customDomain: "",
      });
    },
    onError: (error) => {
      console.error("Failed to update devbox ports:", error);
    },
  });

  const handleAddPort = () => {
    setShowPortForm(true);
  };

  const handleSavePort = () => {
    // Create the port update data
    const portData = {
      number: newPort.number,
      protocol: newPort.protocol,
      exposesPublicDomain: newPort.exposesPublicDomain,
      ...(newPort.customDomain && { customDomain: newPort.customDomain }),
    };

    // Update the devbox with the new port
    updateDevboxMutation.mutate({
      devboxName: target.name || "",
      request: {
        ports: [portData],
      },
    });
  };

  const handleCancelPort = () => {
    setShowPortForm(false);
    setNewPort({
      number: 8080,
      protocol: "HTTP",
      exposesPublicDomain: true,
      customDomain: "",
    });
  };

  const handleDeletePort = (portNumber: number) => {
    // For now, we'll use the update form approach
    // This would need to be implemented based on the devbox API
    console.log("Delete port:", portNumber);
  };

  const handleUpdatePorts = (data: DevboxUpdateFormData) => {
    updateDevboxMutation.mutate({
      devboxName: target.name || "",
      request: {
        ports: data.ports,
      },
    });
  };

  if (!resource || !ports || ports.length === 0) {
    return null;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Globe,
        name: "Devbox Network Ports",
      }}
    >
      <div className="space-y-4">
        {/* Display existing ports */}
        <div className="space-y-2">
          {ports.map((port, index) => (
            <div
              key={`${port.number}-${index}`}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Port {port.number}</span>
                  {port.protocol && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {port.protocol}
                    </span>
                  )}
                </div>
                {port.publicAddress && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Public:</span>
                    <span className="text-xs font-mono">{port.publicAddress}</span>
                  </div>
                )}
                {port.privateAddress && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Private:</span>
                    <span className="text-xs font-mono">{port.privateAddress}</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePort(port.number)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new port form */}
        {!showPortForm ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPort}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Port
          </Button>
        ) : (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Port number"
                  className="w-full"
                  value={newPort.number}
                  onChange={(e) =>
                    setNewPort({
                      ...newPort,
                      number: parseInt(e.target.value) || 8080,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={newPort.exposesPublicDomain}
                  onCheckedChange={(checked) =>
                    setNewPort({
                      ...newPort,
                      exposesPublicDomain: checked as boolean,
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">Public</span>
              </div>
            </div>

            {newPort.exposesPublicDomain && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Select
                    value={newPort.protocol}
                    onValueChange={(value: "HTTP" | "GRPC" | "WS") =>
                      setNewPort({ ...newPort, protocol: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HTTP">HTTP</SelectItem>
                      <SelectItem value="GRPC">GRPC</SelectItem>
                      <SelectItem value="WS">WS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Custom domain (optional)"
                    value={newPort.customDomain}
                    onChange={(e) =>
                      setNewPort({ ...newPort, customDomain: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSavePort}
                disabled={updateDevboxMutation.isPending}
                className="h-8 w-8 p-0"
              >
                {updateDevboxMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelPort}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Advanced port management using the update form */}
        <div className="mt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Advanced Port Management
            </summary>
            <div className="mt-3">
              <DevboxUpdateForm
                defaultValues={{
                  ports: ports.map(port => ({
                    portName: port.name || `port-${port.number}`,
                    number: port.number,
                    protocol: port.protocol as "HTTP" | "GRPC" | "WS" || "HTTP",
                    exposesPublicDomain: !!port.publicAddress,
                    customDomain: port.host || "",
                  })),
                }}
                onSubmit={handleUpdatePorts}
                isLoading={updateDevboxMutation.isPending}
                hideDefaultButton={false}
              />
            </div>
          </details>
        </div>
      </div>
    </BaseActionMessage>
  );
};

export default DevboxNetworkMessage;
