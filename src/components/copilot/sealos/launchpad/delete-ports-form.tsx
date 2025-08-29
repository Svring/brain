"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { CircleCheckBig, Network, Sparkles, Trash2 } from "lucide-react";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";

interface DeletePortsFormProps {
  initialValues: {
    name: string;
    ports: number[];
  };
  onSubmit: (values: { name: string; ports: number[] }) => void;
  context: SealosApiContext;
}

export function DeletePortsForm({ initialValues, onSubmit, context }: DeletePortsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);
  const [selectedPorts, setSelectedPorts] = useState<number[]>([]);
  const { launchpad } = useTRPCClients();
  const queryClient = useQueryClient();

  console.log(initialValues);

  const deleteLaunchpadPorts = useMutation(
    launchpad.deleteLaunchpadPorts.mutationOptions()
  );

  const handleSubmit = async () => {
    if (isSubmitting || selectedPorts.length === 0) return;

    setIsSubmitting(true);

    try {
      const request = {
        name: initialValues.name,
        ports: selectedPorts,
      };

      await deleteLaunchpadPorts.mutateAsync(request);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: launchpad.getLaunchpad.queryKey({ name: initialValues.name }),
      });

      toast.success("Ports deleted successfully!");
      onSubmit({ name: initialValues.name, ports: selectedPorts });
      setIsUpdateCompleted(true);
    } catch (error) {
      console.error("Failed to delete ports:", error);
      toast.error("Failed to delete ports");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePortToggle = (port: number) => {
    setSelectedPorts(prev => 
      prev.includes(port) 
        ? prev.filter(p => p !== port)
        : [...prev, port]
    );
  };

  // Show success message when update is completed
  if (isUpdateCompleted) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: Network,
          name: "Delete Launchpad Ports",
        }}
      >
        <div className="text-center space-y-4">
          <div className="font-medium flex items-center gap-2">
            <CircleCheckBig className="w-4 h-4" />
            Launchpad ports deleted successfully!
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Network,
        name: "Delete Ports",
      }}
      headerSlot={
        <Button
          onClick={handleSubmit}
          size="sm"
          variant="outline"
          disabled={isSubmitting || selectedPorts.length === 0}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          <Sparkles className="w-3 h-3 text-theme-blue" />
          Apply
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Ports to Delete:</label>
          {initialValues.ports.length > 0 ? (
            <div className="space-y-2">
              {initialValues.ports.map((port) => (
                <div key={port} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedPorts.includes(port)}
                    onCheckedChange={() => handlePortToggle(port)}
                  />
                  <label className="text-sm font-medium">
                    Port {port}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No ports available to delete
            </div>
          )}
        </div>
      </div>
    </BaseActionMessage>
  );
}
