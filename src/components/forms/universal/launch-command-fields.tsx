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
import type { LaunchCommand } from "@/schemas/forms/launchpad/components/launch-command-schema";

export const LaunchCommandFields = () => {
  const form = useFormContext<{ launchCommand: LaunchCommand }>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="launchCommand.command"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Command</FormLabel>
            <FormControl>
              <Input 
                placeholder="nginx -g 'daemon off;'" 
                {...field} 
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="launchCommand.args"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Arguments</FormLabel>
            <FormControl>
              <Input 
                placeholder="-c /etc/nginx/nginx.conf" 
                {...field} 
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
