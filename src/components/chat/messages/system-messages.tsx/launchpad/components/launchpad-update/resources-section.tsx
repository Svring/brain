import React from "react";
import { Control } from "react-hook-form";
import { Cpu } from "lucide-react";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { cpuOptions, memoryOptions, replicasOptions } from "./types";
import type { LaunchpadUpdateFormValues } from "./types";

interface ResourcesSectionProps {
  control: Control<LaunchpadUpdateFormValues>;
}

export function ResourcesSection({ control }: ResourcesSectionProps) {
  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          <Label className="text-sm font-medium">Resources</Label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={control}
            name="cpu"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">CPU (m)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cpuOptions.map((cpuValue) => (
                      <SelectItem
                        key={cpuValue}
                        value={cpuValue.toString()}
                      >
                        {cpuValue}m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="memory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Memory (MB)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {memoryOptions.map((memoryValue) => (
                      <SelectItem
                        key={memoryValue}
                        value={memoryValue.toString()}
                      >
                        {memoryValue}MB
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="replicas"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Replicas</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {replicasOptions.map((replicaValue) => (
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
      </div>
      <Separator />
    </>
  );
}
