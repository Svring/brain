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
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface ImageConfigurationProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function ImageConfiguration({ form }: ImageConfigurationProps) {
  return (
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
  );
}
