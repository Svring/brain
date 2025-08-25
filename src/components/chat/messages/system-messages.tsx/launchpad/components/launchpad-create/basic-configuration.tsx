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
import { cpuOptions, memoryOptions, replicasOptions, LaunchpadFormValues } from "./types";

interface BasicConfigurationProps {
  form: UseFormReturn<LaunchpadFormValues>;
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
          name="cpu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPU (m)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value.toString()}
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
                      {cpuValue}m ({cpuValue / 1000} cores)
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
          name="memory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memory (Mi)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value.toString()}
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
                      {memoryValue}Mi ({memoryValue / 1024}GB)
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
          name="replicas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Replicas</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
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
