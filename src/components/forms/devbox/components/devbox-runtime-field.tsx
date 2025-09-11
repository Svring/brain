"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { DEVBOX_RUNTIMES, DevboxRuntime } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { useEffect } from "react";

export const DevboxRuntimeField = () => {
  const form = useFormContext<DevboxCreateFormData>();
  const selectedRuntime = form.watch("runtime");

  // Auto-select the first runtime when no runtime is selected
  useEffect(() => {
    if (!selectedRuntime && DEVBOX_RUNTIMES.length > 0) {
      form.setValue("runtime", DEVBOX_RUNTIMES[0]);
    }
  }, [selectedRuntime, form]);

  return (
    <FormField
      control={form.control}
      name="runtime"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Runtime</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select runtime" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {DEVBOX_RUNTIMES.map((runtime) => (
                <SelectItem key={runtime} value={runtime}>
                  {runtime}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
