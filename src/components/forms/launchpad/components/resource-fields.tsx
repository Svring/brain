"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create/launchpad-create-form-schema";
import { CPU_OPTIONS, MEMORY_OPTIONS, REPLICAS_OPTIONS } from "@/lib/k8s/k8s-constant/k8s-constant-resource";

export const ResourceFields = () => {
  const form = useFormContext<LaunchpadCreateFormData>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="resource.replicas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Replicas</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select replicas" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {REPLICAS_OPTIONS.map((replica) => (
                  <SelectItem key={replica} value={replica.toString()}>
                    {replica}
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
        name="resource.cpu"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPU (cores)</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select CPU" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CPU_OPTIONS.map((cpu) => (
                  <SelectItem key={cpu} value={cpu.toString()}>
                    {cpu}
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
            <FormLabel>Memory (GB)</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select memory" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MEMORY_OPTIONS.map((memory) => (
                  <SelectItem key={memory} value={memory.toString()}>
                    {memory}
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
};
