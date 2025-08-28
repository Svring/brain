"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  CircleCheckBig,
  Settings2,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";

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

interface UpdateImageFormProps {
  initialValues: {
    name: string;
    image?: string;
  };
  onSubmit: (values: { name: string; image: string }) => void;
  context: SealosApiContext;
}

export function UpdateResourceForm({
  initialValues,
  onSubmit,
  context,
}: UpdateResourceFormProps) {
  const [cpu, setCpu] = useState<CpuOption | undefined>(
    initialValues.cpu as CpuOption
  );
  const [memory, setMemory] = useState<MemoryOption | undefined>(
    initialValues.memory as MemoryOption
  );
  const [replicas, setReplicas] = useState<ReplicasOption | undefined>(
    initialValues.replicas as ReplicasOption
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);

  const updateLaunchpad = useUpdateLaunchpadMutation(context);

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
        name: initialValues.name,
        data: {
          resource: resourceData,
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest);

      // Call the onSubmit callback with the updated values
      onSubmit({
        name: initialValues.name,
        cpu: cpu || 0,
        memory: memory || 0,
        replicas: replicas || 0,
      });

      // Mark update as completed
      setIsUpdateCompleted(true);
    } catch (error) {
      console.error("Failed to update launchpad resources:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message when update is completed
  if (isUpdateCompleted) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: Settings2,
          name: "Update Launchpad Resources",
        }}
      >
        <div className="text-center space-y-4">
          <div className="font-medium flex items-center gap-2">
            <CircleCheckBig className="w-4 h-4" />
            Launchpad resources updated successfully!
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
          <Sparkles className="w-3 h-3 text-theme-blue" />
          Apply
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label className="font-medium">Launchpad Name:</Label>
          <div className="text-sm text-muted-foreground mt-1">
            {initialValues.name}
          </div>
        </div>

        {/* CPU Options - only show if cpu is provided */}
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

        {/* Memory Options - only show if memory is provided */}
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

        {/* Replicas - only show if replicas is provided */}
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
    </BaseActionMessage>
  );
}

export function UpdateImageForm({
  initialValues,
  onSubmit,
  context,
}: UpdateImageFormProps) {
  const [image, setImage] = useState<string>(initialValues.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);

  const updateLaunchpad = useUpdateLaunchpadMutation(context);

  const handleSubmit = async () => {
    if (isSubmitting || !image.trim()) return;

    setIsSubmitting(true);

    try {
      const updateRequest = {
        name: initialValues.name,
        data: {
          image: image.trim(),
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest);

      // Call the onSubmit callback with the updated values
      onSubmit({
        name: initialValues.name,
        image: image.trim(),
      });

      // Mark update as completed
      setIsUpdateCompleted(true);
    } catch (error) {
      console.error("Failed to update launchpad image:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message when update is completed
  if (isUpdateCompleted) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: ImageIcon,
          name: "Update Launchpad Image",
        }}
      >
        <div className="text-center space-y-4">
          <div className="font-medium flex items-center gap-2">
            <CircleCheckBig className="w-4 h-4" />
            Launchpad image updated successfully!
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: ImageIcon,
        name: "Update Image",
      }}
      headerSlot={
        <Button
          onClick={handleSubmit}
          size="sm"
          variant="outline"
          disabled={isSubmitting || !image.trim()}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          <Sparkles className="w-3 h-3 text-theme-blue" />
          Apply
        </Button>
      }
    >
      {/* Image Input */}
      <div className="space-y-2">
        <Label className="font-medium">New Image:</Label>
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Enter image URL (e.g., nginx:latest)"
          className="w-full"
        />
      </div>
    </BaseActionMessage>
  );
}
