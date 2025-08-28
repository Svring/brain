"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
  type CpuOption,
  type MemoryOption,
  type ReplicasOption,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  CircleCheckBig,
  Settings,
  Settings2,
  Check,
  Sparkles,
} from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import BaseActionMessage from "../../../components/base-action-message";
import { Spinner } from "@/components/ui/spinner";

interface LaunchpadUpdateResourceProps {
  target: BuiltinResourceTarget;
}

export default function LaunchpadUpdateResource({
  target,
}: LaunchpadUpdateResourceProps) {
  const [cpu, setCpu] = useState<CpuOption | undefined>();
  const [memory, setMemory] = useState<MemoryOption | undefined>();
  const [replicas, setReplicas] = useState<ReplicasOption | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);

  const { launchpad } = useTRPCClients();
  const updateLaunchpad = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  // Get current resource status using the hook
  const { resource, isLoading, error } = useResourceStatus(target);

  // Set initial values from current resource when data is loaded
  React.useEffect(() => {
    if (resource) {
      // Handle different resource structures
      const currentResource =
        (resource as any).resource || (resource as any).resources;
      if (currentResource) {
        if (currentResource.cpu !== undefined)
          setCpu(currentResource.cpu as CpuOption);
        if (currentResource.memory !== undefined)
          setMemory(currentResource.memory as MemoryOption);
        if (currentResource.replicas !== undefined)
          setReplicas(currentResource.replicas as ReplicasOption);
      }
    }
  }, [resource]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Build resource object only with provided values
      const resourceData: any = {};
      if (cpu !== undefined) resourceData.cpu = cpu;
      if (memory !== undefined) resourceData.memory = memory;
      if (replicas !== undefined) resourceData.replicas = replicas;

      const updateRequest = {
        name: target.name!,
        request: {
          resource: resourceData,
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest);

      // Mark update as completed
      setIsUpdateCompleted(true);
    } catch (error) {
      console.error("Failed to update launchpad resources:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: Settings2,
          name: "Update Launchpad Resources",
        }}
      >
        <div className="p-4">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Loading current resource configuration...
            </div>
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  // Show error state
  if (error) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: Settings2,
          name: "Update Launchpad Resources",
        }}
      >
        <div className="p-4">
          <div className="text-center space-y-4">
            <div className="text-red-600 font-medium">
              Error loading resource: {error.message}
            </div>
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  // Show success message when update is completed
  if (isUpdateCompleted) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: Settings2,
          name: "Update Launchpad Resources",
        }}
      >
        <div className="p-4">
          <div className="text-center space-y-4">
            <div className="font-medium flex items-center gap-2">
              <CircleCheckBig className="w-4 h-4" />
              Launchpad resources updated successfully!
            </div>
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Settings2,
        name: "Update Resource Quota",
      }}
      headerSlot={
        <Button
          onClick={handleSubmit}
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          {isSubmitting ? (
            <Spinner className="w-3 h-3" />
          ) : (
            <Sparkles className="w-3 h-3 text-theme-blue" />
          )}
          {isSubmitting ? "Updating..." : "Apply"}
        </Button>
      }
    >
      <div className="p-4 space-y-6">
        {isSubmitting ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Spinner className="w-8 h-8" />
            </div>
            <div className="text-sm text-muted-foreground">
              Updating launchpad resources...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* CPU Options - only show if cpu is available */}
            {cpu !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">CPU:</Label>
                  <span className="text-sm">{cpu}C</span>
                </div>
                <Slider
                  value={[CPU_OPTIONS.indexOf(cpu)]}
                  onValueChange={(value) =>
                    setCpu(CPU_OPTIONS[value[0]] as CpuOption)
                  }
                  min={0}
                  max={CPU_OPTIONS.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="CPU slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{CPU_OPTIONS[0]}C</span>
                  <span>{CPU_OPTIONS[CPU_OPTIONS.length - 1]}C</span>
                </div>
              </div>
            )}

            {/* Memory Options - only show if memory is available */}
            {memory !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Memory:</Label>
                  <span className="text-sm">{memory}G</span>
                </div>
                <Slider
                  value={[MEMORY_OPTIONS.indexOf(memory)]}
                  onValueChange={(value) =>
                    setMemory(MEMORY_OPTIONS[value[0]] as MemoryOption)
                  }
                  min={0}
                  max={MEMORY_OPTIONS.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="Memory slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{MEMORY_OPTIONS[0]}G</span>
                  <span>{MEMORY_OPTIONS[MEMORY_OPTIONS.length - 1]}G</span>
                </div>
              </div>
            )}

            {/* Replicas - only show if replicas is available */}
            {replicas !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Replicas:</Label>
                  <span className="text-sm">{replicas}</span>
                </div>
                <Slider
                  value={[REPLICAS_OPTIONS.indexOf(replicas)]}
                  onValueChange={(value) =>
                    setReplicas(REPLICAS_OPTIONS[value[0]] as ReplicasOption)
                  }
                  min={0}
                  max={REPLICAS_OPTIONS.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="Replicas slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{REPLICAS_OPTIONS[0]}</span>
                  <span>{REPLICAS_OPTIONS[REPLICAS_OPTIONS.length - 1]}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseActionMessage>
  );
}
