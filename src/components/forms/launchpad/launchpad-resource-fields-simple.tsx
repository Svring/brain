"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LaunchpadResourceUpdate } from "@/schemas/forms/launchpad/components/launchpad-resource-schema";
import { Slider } from "@/components/ui/slider";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useEffect, useState } from "react";
import { convertK8sResourceToNumeric } from "@/lib/k8s/k8s-method/k8s-utils";

// CPU options from launchpad resource schema
const LAUNCHPAD_CPU_OPTIONS = [0.1, 0.2, 0.5, 1, 2, 4, 8, 16] as const;

// Memory options from launchpad resource schema
const LAUNCHPAD_MEMORY_OPTIONS = [0.1, 0.5, 1, 2, 4, 8, 16, 32] as const;

interface LaunchpadResourceFieldsSimpleProps {
  cpuOptions?: readonly number[];
  memoryOptions?: readonly number[];
}

export const LaunchpadResourceFieldsSimple = ({
  cpuOptions = LAUNCHPAD_CPU_OPTIONS,
  memoryOptions = LAUNCHPAD_MEMORY_OPTIONS,
}: LaunchpadResourceFieldsSimpleProps = {}) => {
  const form = useFormContext<{
    resource: LaunchpadResourceUpdate;
    name: string;
  }>();
  const resourceValues = form.watch("resource");
  const nameValue = form.watch("name");

  // Construct both deployment and statefulset targets
  const deploymentTarget = convertResourceTypeToTarget("deployment", nameValue);
  const statefulsetTarget = convertResourceTypeToTarget(
    "statefulset",
    nameValue
  );

  // Use useResourceStatus to get the launchpad resource from both targets
  const { resource: deploymentObject } = useResourceStatus(deploymentTarget);

  const { resource: statefulsetObject } = useResourceStatus(statefulsetTarget);

  // Use the object that exists (only one will have valid data)
  const object = deploymentObject?.resource || statefulsetObject?.resource;

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

  // Convert object values to numeric for comparison
  const objectNumeric = convertK8sResourceToNumeric({
    cpu: object?.cpu,
    memory: object?.memory,
  });

  // Initialize form values with object values when resource values are null
  useEffect(() => {
    if (
      objectNumeric.cpu.nearest !== undefined &&
      resourceValues?.cpu === null
    ) {
      // Find the closest CPU option to the current object value
      const closestCpuOption = cpuOptions.reduce((prev, curr) =>
        Math.abs(curr - objectNumeric.cpu.nearest!) <
        Math.abs(prev - objectNumeric.cpu.nearest!)
          ? curr
          : prev
      );
      form.setValue("resource.cpu", closestCpuOption);
    }

    if (
      objectNumeric.memory.nearest !== undefined &&
      resourceValues?.memory === null
    ) {
      // Find the closest memory option to the current object value
      const closestMemoryOption = memoryOptions.reduce((prev, curr) =>
        Math.abs(curr - objectNumeric.memory.nearest!) <
        Math.abs(prev - objectNumeric.memory.nearest!)
          ? curr
          : prev
      );
      form.setValue("resource.memory", closestMemoryOption);
    }
  }, [objectNumeric, resourceValues, cpuOptions, memoryOptions, form]);

  return (
    <div className="space-y-2 px-2">
      {/* CPU Options - show if cpu is provided (either as value or null) */}
      {resourceValues && "cpu" in resourceValues && (
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
                    objectNumeric.cpu.nearest,
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

      {/* Memory Options - show if memory is provided (either as value or null) */}
      {resourceValues && "memory" in resourceValues && (
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
                    objectNumeric.memory.nearest,
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
