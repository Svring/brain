"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LaunchpadResource } from "@/schemas/forms/launchpad/components/launchpad-resource-schema";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { HpaFields } from "../universal/hpa-fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

// CPU options from launchpad resource schema
const LAUNCHPAD_CPU_OPTIONS = [0.1, 0.2, 0.5, 1, 2, 4, 8, 16] as const;

// Memory options from launchpad resource schema
const LAUNCHPAD_MEMORY_OPTIONS = [0.1, 0.5, 1, 2, 4, 8, 16, 32] as const;

interface LaunchpadResourceFieldsProps {
  cpuOptions?: readonly number[];
  memoryOptions?: readonly number[];
}

export const LaunchpadResourceFields = ({
  cpuOptions = LAUNCHPAD_CPU_OPTIONS,
  memoryOptions = LAUNCHPAD_MEMORY_OPTIONS,
}: LaunchpadResourceFieldsProps = {}) => {
  const form = useFormContext<{ resource: LaunchpadResource }>();
  const resourceValues = form.watch("resource");
  const [scalingMode, setScalingMode] = useState<"replicas" | "hpa">(
    "replicas"
  );

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

      {/* Scaling Configuration - Replicas or HPA */}
      {(resourceValues?.replicas !== undefined ||
        resourceValues?.hpa !== undefined) && (
        <div className="space-y-4">
          <FormLabel className="font-medium">Scaling Configuration</FormLabel>
          <Tabs
            value={scalingMode}
            onValueChange={(value) =>
              setScalingMode(value as "replicas" | "hpa")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="replicas">Fixed Replicas</TabsTrigger>
              <TabsTrigger value="hpa">HPA</TabsTrigger>
            </TabsList>

            <TabsContent value="replicas" className="space-y-4">
              {resourceValues?.replicas !== undefined && (
                <FormField
                  control={form.control}
                  name="resource.replicas"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel className="font-medium">Replicas:</FormLabel>
                        <span className="">{field.value || 1}</span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[field.value || 1]}
                          onValueChange={(value) => field.onChange(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                          aria-label="Replicas slider"
                        />
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            1
                          </span>
                          <span className="text-xs text-muted-foreground">
                            10
                          </span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="hpa" className="space-y-4">
              {resourceValues?.hpa !== undefined && (
                <FormField
                  control={form.control}
                  name="resource.hpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Horizontal Pod Autoscaler (HPA)
                      </FormLabel>
                      <div className="p-4 border border-dashed rounded-lg">
                        <HpaFields />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
