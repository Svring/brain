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

// CPU options from devbox resource schema
const DEVBOX_CPU_OPTIONS = [0.1, 0.2, 0.5, 1, 2, 4, 8, 16] as const;

// Memory options from devbox resource schema
const DEVBOX_MEMORY_OPTIONS = [0.1, 0.5, 1, 2, 4, 8, 16, 32] as const;

interface DevboxResourceFieldsProps {
  cpuOptions?: readonly number[];
  memoryOptions?: readonly number[];
}

export const DevboxResourceFields = ({
  cpuOptions = DEVBOX_CPU_OPTIONS,
  memoryOptions = DEVBOX_MEMORY_OPTIONS,
}: DevboxResourceFieldsProps = {}) => {
  const form = useFormContext<{ resource: DevboxResource }>();
  const resourceValues = form.watch("resource");

  return (
    <div className="space-y-6 p-2">
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
                  <span className="">{field.value || cpuOptions[0]}C</span>
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
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {cpuOptions.map((cpu, index) => {
                        const position =
                          (index / (cpuOptions.length - 1)) * 100;
                        return (
                          <span
                            key={cpu}
                            className="absolute text-center transform -translate-x-1/4"
                            style={{ left: `${position}%` }}
                          >
                            {cpu}C
                          </span>
                        );
                      })}
                    </div>
                    <div className="h-4"></div> {/* Spacer for labels */}
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
                  <span className="">{field.value || memoryOptions[0]}G</span>
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
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {memoryOptions.map((memory, index) => {
                        const position =
                          (index / (memoryOptions.length - 1)) * 100;
                        return (
                          <span
                            key={memory}
                            className="absolute text-center transform -translate-x-1/4"
                            style={{ left: `${position}%` }}
                          >
                            {memory}G
                          </span>
                        );
                      })}
                    </div>
                    <div className="h-4"></div> {/* Spacer for labels */}
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
