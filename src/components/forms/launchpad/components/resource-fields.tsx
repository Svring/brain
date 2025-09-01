"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create/launchpad-create-form-schema";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { Slider } from "@/components/ui/slider";

export const ResourceFields = () => {
  const form = useFormContext<LaunchpadCreateFormData>();

  return (
    <div className="space-y-6">
      {/* CPU Options */}
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
                      const position = (index / (CPU_OPTIONS.length - 1)) * 100;
                      return (
                        <span
                          key={cpu}
                          className="absolute text-center transform -translate-x-1/2"
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

      {/* Memory Options */}
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
                          className="absolute text-center transform -translate-x-1/2"
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

      {/* Replicas */}
      <FormField
        control={form.control}
        name="resource.replicas"
        render={({ field }) => {
          const currentIndex =
            REPLICAS_OPTIONS.findIndex((option) => option === field.value) || 0;

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
                          className="absolute text-center transform -translate-x-1/2"
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
    </div>
  );
};
