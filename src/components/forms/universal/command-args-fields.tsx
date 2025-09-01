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
import { Command } from "@/schemas/forms/universal/command-schema";
import { Args } from "@/schemas/forms/universal/args-schema";

export const CommandField = () => {
  const form = useFormContext<{ command: Command }>();

  return (
    <FormField
      control={form.control}
      name="command"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Command</FormLabel>
          <FormControl>
            <Input placeholder="nginx -g 'daemon off;'" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const ArgsField = () => {
  const form = useFormContext<{ args: Args }>();

  return (
    <FormField
      control={form.control}
      name="args"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Arguments</FormLabel>
          <FormControl>
            <Input placeholder="-c /etc/nginx/nginx.conf" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
