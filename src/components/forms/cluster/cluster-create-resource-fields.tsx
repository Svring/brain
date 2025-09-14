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
import { Slider } from "@/components/ui/slider";

interface ClusterCreateResourceFieldsProps {
  cpuOptions?: readonly number[];
  memoryOptions?: readonly number[];
  replicasOptions?: readonly number[];
  storageOptions?: readonly number[];
}

export const ClusterCreateResourceFields = ({
  cpuOptions = [0.1, 0.2, 0.5, 1, 2, 4, 8, 16],
  memoryOptions = [0.1, 0.5, 1, 2, 4, 8, 16, 32],
  replicasOptions = [1, 2, 3, 5, 10],
  storageOptions = [1, 2, 5, 10, 20, 50, 100],
}: ClusterCreateResourceFieldsProps = {}) => {
  const form = useFormContext<{
    resource: Resource & { storage?: number };
    name: string;
  }>();
  const resourceValues = form.watch("resource");

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
                  <span className="font-medium">
                    {field.value || cpuOptions[0]}C
                  </span>
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
                  <span className="font-medium">
                    {field.value || memoryOptions[0]}G
                  </span>
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
                  <span className="font-medium">
                    {field.value || storageOptions[0]}G
                  </span>
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
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      {storageOptions[0]}G
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {storageOptions[storageOptions.length - 1]}G
                    </span>
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
                  <span className="font-medium">
                    {field.value || replicasOptions[0]}
                  </span>
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
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      {replicasOptions[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {replicasOptions[replicasOptions.length - 1]}
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
