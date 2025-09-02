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

export const ResourceFields = () => {
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
              CPU_OPTIONS.findIndex((option) => option === field.value) || 0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">CPU:</FormLabel>
                  <span className="">{field.value || CPU_OPTIONS[0]}C</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(CPU_OPTIONS[value[0]])
                    }
                    min={0}
                    max={CPU_OPTIONS.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="CPU slider"
                  />
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {CPU_OPTIONS.map((cpu, index) => {
                        const position =
                          (index / (CPU_OPTIONS.length - 1)) * 100;
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
              MEMORY_OPTIONS.findIndex((option) => option === field.value) || 0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">Memory:</FormLabel>
                  <span className="">{field.value || MEMORY_OPTIONS[0]}G</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(MEMORY_OPTIONS[value[0]])
                    }
                    min={0}
                    max={MEMORY_OPTIONS.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Memory slider"
                  />
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {MEMORY_OPTIONS.map((memory, index) => {
                        const position =
                          (index / (MEMORY_OPTIONS.length - 1)) * 100;
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
              STORAGE_OPTIONS.findIndex((option) => option === field.value) || 0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">Storage:</FormLabel>
                  <span className="">{field.value || STORAGE_OPTIONS[0]}G</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(STORAGE_OPTIONS[value[0]])
                    }
                    min={0}
                    max={STORAGE_OPTIONS.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Storage slider"
                  />
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {STORAGE_OPTIONS.map((storage, index) => {
                        const position =
                          (index / (STORAGE_OPTIONS.length - 1)) * 100;
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
              REPLICAS_OPTIONS.findIndex((option) => option === field.value) ||
              0;

            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="font-medium">Replicas:</FormLabel>
                  <span className="">{field.value || REPLICAS_OPTIONS[0]}</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[currentIndex]}
                    onValueChange={(value) =>
                      field.onChange(REPLICAS_OPTIONS[value[0]])
                    }
                    min={0}
                    max={REPLICAS_OPTIONS.length - 1}
                    step={1}
                    className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                    aria-label="Replicas slider"
                  />
                  <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {REPLICAS_OPTIONS.map((replica, index) => {
                        const position =
                          (index / (REPLICAS_OPTIONS.length - 1)) * 100;
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
