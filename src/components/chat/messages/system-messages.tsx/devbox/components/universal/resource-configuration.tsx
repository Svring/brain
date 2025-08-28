import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DevboxCreate } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-mutation-schema";
import { CPU_OPTIONS, MEMORY_OPTIONS } from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { Slider } from "@/components/ui/slider";

interface ResourceConfigurationProps {
  form: UseFormReturn<DevboxCreate>;
}

export function ResourceConfiguration({ form }: ResourceConfigurationProps) {
  // Convert CPU options to millicores for devbox
  const cpuOptions = CPU_OPTIONS.map(cpu => cpu * 1000);
  // Convert memory options to MB for devbox
  const memoryOptions = MEMORY_OPTIONS.map(memory => memory * 1024);

  return (
    <div className="space-y-6">
      {/* CPU Options */}
      <FormField
        control={form.control}
        name="resource.cpu"
        render={({ field }) => {
          const currentValue = parseInt(field.value) || cpuOptions[0];
          const currentIndex = cpuOptions.findIndex((option) => option === currentValue) || 0;

          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="font-medium">CPU:</FormLabel>
                <span className="">{currentValue / 1000}C</span>
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
        name="resource.memory"
        render={({ field }) => {
          const currentValue = parseInt(field.value) || memoryOptions[0];
          const currentIndex = memoryOptions.findIndex((option) => option === currentValue) || 0;

          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="font-medium">Memory:</FormLabel>
                <span className="">{currentValue / 1024}G</span>
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
    </div>
  );
}
