"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Resource } from "@/schemas/forms/universal/resource-schema";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
  STORAGE_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { Slider } from "@/components/ui/slider";

interface ResourceFieldsProps {
  cpuOptions?: readonly number[];
  memoryOptions?: readonly number[];
  replicasOptions?: readonly number[];
  storageOptions?: readonly number[];
}

export const ResourceFields = ({
  cpuOptions = CPU_OPTIONS,
  memoryOptions = MEMORY_OPTIONS,
  replicasOptions = REPLICAS_OPTIONS,
  storageOptions = STORAGE_OPTIONS,
}: ResourceFieldsProps = {}) => {
  const form = useFormContext<{ resource: Resource & { storage?: number } }>();
  const resourceValues = form.watch("resource");

  return (
    <div className="space-y-6">
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

      {/* Storage Options - only show if storage value is defined */}
      {resourceValues?.storage !== undefined && (
        <FormField
          control={form.control}
          name="resource.storage"
          render={({ field }) => {
            const currentIndex =
              storageOptions.findIndex((option) => option === field.value) || 0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">Storage:</FormLabel>
                  <span className="">{field.value || storageOptions[0]}G</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(storageOptions[value[0]])
                    }
                    min={0}
                    max={storageOptions.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Storage slider"
                  />
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {storageOptions.map((storage, index) => {
                        const position =
                          (index / (storageOptions.length - 1)) * 100;
                        return (
                          <span
                            key={storage}
                            className="absolute text-center transform -translate-x-1/4"
                            style={{ left: `${position}%` }}
                          >
                            {storage}G
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

      {/* Replicas - only show if replicas value is defined */}
      {resourceValues?.replicas !== undefined && (
        <FormField
          control={form.control}
          name="resource.replicas"
          render={({ field }) => {
            const currentIndex =
              replicasOptions.findIndex((option) => option === field.value) ||
              0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">Replicas:</FormLabel>
                  <span className="">{field.value || replicasOptions[0]}</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(replicasOptions[value[0]])
                    }
                    min={0}
                    max={replicasOptions.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Replicas slider"
                  />
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {replicasOptions.map((replica, index) => {
                        const position =
                          (index / (replicasOptions.length - 1)) * 100;
                        return (
                          <span
                            key={replica}
                            className="absolute text-center transform -translate-x-1/4"
                            style={{ left: `${position}%` }}
                          >
                            {replica}
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
