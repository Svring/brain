import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { z } from "zod";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
  STORAGE_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";

// Use resource options directly from k8s constants
const cpuOptions = CPU_OPTIONS;
const memoryOptions = MEMORY_OPTIONS;
const replicasOptions = REPLICAS_OPTIONS; // Take first 6 options: [1, 2, 3, 4, 5, 6]

// Form schema for cluster resources
export const clusterResourceSchema = z.object({
  cpu: z.string().min(1, "CPU is required"),
  memory: z.string().min(1, "Memory is required"),
  storage: z.string().min(1, "Storage is required"),
  replicas: z.string().min(1, "Replicas is required"),
});

type ClusterResourceForm = z.infer<typeof clusterResourceSchema>;

interface ClusterResourceConfigurationProps {
  form: UseFormReturn<any>; // Using any to accommodate the parent form structure
}

export function ClusterResourceConfiguration({
  form,
}: ClusterResourceConfigurationProps) {
  return (
    <div className="space-y-6">
      {/* CPU Options */}
      <FormField
        control={form.control}
        name="cpu"
        render={({ field }) => {
          const currentValue = parseFloat(field.value) || cpuOptions[0];
          const currentIndex =
            cpuOptions.findIndex((option) => option === currentValue) || 0;

          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="font-medium">CPU:</FormLabel>
                <span className="">{currentValue}C</span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[currentIndex]}
                  onValueChange={(value) =>
                    field.onChange(cpuOptions[value[0]].toString())
                  }
                  min={0}
                  max={cpuOptions.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="CPU slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{CPU_OPTIONS[0]}C</span>
                  <span>{CPU_OPTIONS[CPU_OPTIONS.length - 1]}C</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Memory Options */}
      <FormField
        control={form.control}
        name="memory"
        render={({ field }) => {
          const currentValue = parseFloat(field.value) || memoryOptions[0];
          const currentIndex =
            memoryOptions.findIndex((option) => option === currentValue) || 0;

          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="font-medium">Memory:</FormLabel>
                <span className="">{currentValue}G</span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[currentIndex]}
                  onValueChange={(value) =>
                    field.onChange(memoryOptions[value[0]].toString())
                  }
                  min={0}
                  max={memoryOptions.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="Memory slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{MEMORY_OPTIONS[0]}G</span>
                  <span>{MEMORY_OPTIONS[MEMORY_OPTIONS.length - 1]}G</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Storage Options */}
      <FormField
        control={form.control}
        name="storage"
        render={({ field }) => {
          const currentValue = parseFloat(field.value) || STORAGE_OPTIONS[0];
          const currentIndex =
            STORAGE_OPTIONS.findIndex((option) => option === currentValue) || 0;

          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="font-medium">Storage:</FormLabel>
                <span className="">{currentValue}Gi</span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[currentIndex]}
                  onValueChange={(value) =>
                    field.onChange(STORAGE_OPTIONS[value[0]].toString())
                  }
                  min={0}
                  max={STORAGE_OPTIONS.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="Storage slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{STORAGE_OPTIONS[0]}Gi</span>
                  <span>{STORAGE_OPTIONS[STORAGE_OPTIONS.length - 1]}Gi</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Replicas Options */}
      <FormField
        control={form.control}
        name="replicas"
        render={({ field }) => {
          const currentValue = parseFloat(field.value) || replicasOptions[0];
          const currentIndex =
            replicasOptions.findIndex((option) => option === currentValue) || 0;

          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="font-medium">Replicas:</FormLabel>
                <span className="">{currentValue}</span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[currentIndex]}
                  onValueChange={(value) =>
                    field.onChange(replicasOptions[value[0]].toString())
                  }
                  min={0}
                  max={replicasOptions.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="Replicas slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{REPLICAS_OPTIONS[0]}</span>
                  <span>{REPLICAS_OPTIONS[REPLICAS_OPTIONS.length - 1]}</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
