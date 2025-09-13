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
import { HpaFields } from "../universal/hpa-fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

interface LaunchpadDeploymentFieldsProps {}

export const LaunchpadDeploymentFields = ({}: LaunchpadDeploymentFieldsProps = {}) => {
  const form = useFormContext<{ resource: LaunchpadResourceUpdate }>();
  const resourceValues = form.watch("resource");
  const [scalingMode, setScalingMode] = useState<"replicas" | "hpa">(
    "replicas"
  );

  // Watch hpa field and clean up when null
  const hpaValue = form.watch("resource.hpa");

  useEffect(() => {
    if (hpaValue === null) {
      form.unregister("resource.hpa");
    }
  }, [hpaValue, form]);

  // Initialize HPA field when switching to HPA tab
  useEffect(() => {
    if (scalingMode === "hpa" && !hpaValue) {
      form.setValue("resource.hpa", {
        target: "cpu",
        value: 70,
        minReplicas: 1,
        maxReplicas: 10,
      });
    }
  }, [scalingMode, hpaValue, form]);

  return (
    <div className="space-y-6 p-2">
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
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
