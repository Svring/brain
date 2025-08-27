import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
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
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { cpuOptions, memoryOptions, replicasOptions } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface BasicConfigurationProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function BasicConfiguration({ form }: BasicConfigurationProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter application name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Container Image</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., nginx:latest, node:18-alpine"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="resource.cpu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPU (C)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseFloat(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CPU" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cpuOptions.map((cpuValue) => (
                    <SelectItem
                      key={cpuValue}
                      value={cpuValue.toString()}
                    >
                      {cpuValue}C
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resource.memory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memory (G)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseFloat(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Memory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {memoryOptions.map((memoryValue) => (
                    <SelectItem
                      key={memoryValue}
                      value={memoryValue.toString()}
                    >
                      {memoryValue}G
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
  );
}
