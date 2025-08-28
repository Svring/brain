"use client";

import React, { useState } from "react";
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
import { useUpdateLaunchpadMutation } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";

interface UpdateResourceFormProps {
  initialValues: {
    name: string;
    cpu?: number;
    memory?: number;
    replicas?: number;
  };
  onSubmit: (values: {
    name: string;
    cpu: number;
    memory: number;
    replicas: number;
  }) => void;
  context: SealosApiContext;
}

export function UpdateResourceForm({ initialValues, onSubmit, context }: UpdateResourceFormProps) {
  const [cpu, setCpu] = useState<CpuOption>(initialValues.cpu as CpuOption || CPU_OPTIONS[0]);
  const [memory, setMemory] = useState<MemoryOption>(initialValues.memory as MemoryOption || MEMORY_OPTIONS[0]);
  const [replicas, setReplicas] = useState<ReplicasOption>(initialValues.replicas as ReplicasOption || REPLICAS_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateLaunchpad = useUpdateLaunchpadMutation(context);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const updateRequest = {
        name: initialValues.name,
        data: {
          resource: {
            cpu,
            memory,
            replicas,
          },
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest);
      
      // Call the onSubmit callback with the updated values
      onSubmit({
        name: initialValues.name,
        cpu,
        memory,
        replicas,
      });
    } catch (error) {
      console.error('Failed to update launchpad resources:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-background">
      <div className="space-y-4">
        <div>
          <Label className="font-medium">Launchpad Name:</Label>
          <div className="text-sm text-muted-foreground mt-1">{initialValues.name}</div>
        </div>

        {/* CPU Options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="font-medium">CPU:</Label>
            <span className="text-sm">{cpu}C</span>
          </div>
          <Slider
            value={[CPU_OPTIONS.indexOf(cpu)]}
            onValueChange={(value) => setCpu(CPU_OPTIONS[value[0]] as CpuOption)}
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

        {/* Memory Options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="font-medium">Memory:</Label>
            <span className="text-sm">{memory}G</span>
          </div>
          <Slider
            value={[MEMORY_OPTIONS.indexOf(memory)]}
            onValueChange={(value) => setMemory(MEMORY_OPTIONS[value[0]] as MemoryOption)}
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

        {/* Replicas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="font-medium">Replicas:</Label>
            <span className="text-sm">{replicas}</span>
          </div>
          <Slider
            value={[REPLICAS_OPTIONS.indexOf(replicas)]}
            onValueChange={(value) => setReplicas(REPLICAS_OPTIONS[value[0]] as ReplicasOption)}
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
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update Resources"}
      </Button>
    </div>
  );
}
