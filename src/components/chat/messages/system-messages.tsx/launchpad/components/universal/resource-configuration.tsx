import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { Slider } from "@/components/ui/slider";

interface ResourceConfigurationProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function ResourceConfiguration({ form }: ResourceConfigurationProps) {
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

      {/* Replicas - Now using slider */}
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
