"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { DevboxResource } from "@/schemas/forms/devbox/components/devbox-resource-schema";
import { Slider } from "@/components/ui/slider";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useEffect, useState } from "react";
import { convertK8sResourceToNumeric } from "@/lib/k8s/k8s-method/k8s-utils";

// CPU options from devbox resource schema
const DEVBOX_CPU_OPTIONS = [0.5, 1, 2, 4, 8, 16] as const;

// Memory options from devbox resource schema
const DEVBOX_MEMORY_OPTIONS = [0.5, 1, 2, 4, 8, 16, 32] as const;

interface DevboxResourceFieldsProps {
  cpuOptions?: readonly number[];
  memoryOptions?: readonly number[];
}

export const DevboxResourceFields = ({
  cpuOptions = DEVBOX_CPU_OPTIONS,
  memoryOptions = DEVBOX_MEMORY_OPTIONS,
}: DevboxResourceFieldsProps = {}) => {
  const form = useFormContext<{ resource: DevboxResource; name: string }>();
  const resourceValues = form.watch("resource");
  const nameValue = form.watch("name");
  const target = convertResourceTypeToTarget("devbox", nameValue);

  // console.log("target", target);

  // Use useResourceStatus to get the devbox resource
  const { resource: object } = useResourceStatus(
    target,
    (object) => object.resources
  );

  // Return null if object is undefined
  if (object === undefined) {
    return null;
  }

  // Helper function to create comparison display
  const createComparisonDisplay = (
    formValue: number,
    objectValue: number | undefined,
    unit: string
  ) => {
    if (objectValue !== undefined && objectValue !== formValue) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through">
            {objectValue}
            {unit}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium">
            {formValue}
            {unit}
          </span>
        </div>
      );
    }
    return (
      <span className="font-medium">
        {formValue}
        {unit}
      </span>
    );
  };

  return (
    <div className="space-y-2 px-2">
      {/* CPU Options - only show if cpu value is defined */}
      {resourceValues?.cpu !== undefined && (
        <FormField
          control={form.control}
          name="resource.cpu"
          render={({ field }) => {
            const currentIndex =
              cpuOptions.findIndex((option) => option === field.value) || 0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">CPU:</FormLabel>
                  {createComparisonDisplay(
                    field.value || cpuOptions[0],
                    object.cpu,
                    "C"
                  )}
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(cpuOptions[value[0]])
                    }
                    min={0}
                    max={cpuOptions.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="CPU slider"
                  />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      {cpuOptions[0]}C
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cpuOptions[cpuOptions.length - 1]}C
                    </span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}

      {/* Memory Options - only show if memory value is defined */}
      {resourceValues?.memory !== undefined && (
        <FormField
          control={form.control}
          name="resource.memory"
          render={({ field }) => {
            const currentIndex =
              memoryOptions.findIndex((option) => option === field.value) || 0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">Memory:</FormLabel>
                  {createComparisonDisplay(
                    field.value || memoryOptions[0],
                    object.memory,
                    "G"
                  )}
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(memoryOptions[value[0]])
                    }
                    min={0}
                    max={memoryOptions.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Memory slider"
                  />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      {memoryOptions[0]}G
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {memoryOptions[memoryOptions.length - 1]}G
                    </span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    </div>
  );
};
