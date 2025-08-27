import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";

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
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">CPU (C)</FormLabel>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {CPU_OPTIONS.map((cpuValue) => (
                  <Button
                    key={cpuValue}
                    type="button"
                    variant={
                      field.value === cpuValue ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => field.onChange(cpuValue)}
                    className="min-w-[60px]"
                  >
                    {cpuValue}C
                  </Button>
                ))}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Memory Options */}
      <FormField
        control={form.control}
        name="resource.memory"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Memory (G)</FormLabel>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {MEMORY_OPTIONS.map((memoryValue) => (
                  <Button
                    key={memoryValue}
                    type="button"
                    variant={
                      field.value === memoryValue ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => field.onChange(memoryValue)}
                    className="min-w-[60px]"
                  >
                    {memoryValue}G
                  </Button>
                ))}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Replicas - Keep as dropdown */}
      <FormField
        control={form.control}
        name="resource.replicas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Replicas</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(parseInt(value))}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Replicas" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {REPLICAS_OPTIONS.map((replicaValue) => (
                  <SelectItem
                    key={replicaValue}
                    value={replicaValue.toString()}
                  >
                    {replicaValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
