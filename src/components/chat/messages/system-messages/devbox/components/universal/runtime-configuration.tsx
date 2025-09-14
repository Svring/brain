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
import { DevboxCreate } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-mutation-schema";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";

interface RuntimeConfigurationProps {
  form: UseFormReturn<DevboxCreate>;
}

export function RuntimeConfiguration({ form }: RuntimeConfigurationProps) {
  return (
    <FormField
      control={form.control}
      name="runtime.template"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Runtime</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
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
}
