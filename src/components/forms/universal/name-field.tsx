"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Name } from "@/schemas/forms/universal/name-schema";

export const NameField = () => {
  const form = useFormContext<{ name: Name }>();

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Application Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter application name"
              maxLength={60}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};


