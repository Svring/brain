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
import { DevboxCreate } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-mutation-schema";

interface NameConfigurationProps {
  form: UseFormReturn<DevboxCreate>;
}

export function NameConfiguration({ form }: NameConfigurationProps) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Devbox Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter devbox name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
