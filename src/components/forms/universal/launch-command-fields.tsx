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
import { LaunchCommand } from "@/schemas/forms/launchpad/components/launch-command-schema";
import { useEffect } from "react";

export const LaunchCommandFields = () => {
  const form = useFormContext<{ launchCommand: LaunchCommand }>();

  // Watch for changes in launch command fields and clean up when empty
  const launchCommand = form.watch("launchCommand");
  
  useEffect(() => {
    if (launchCommand && (!launchCommand.command && !launchCommand.args)) {
      // If both command and args are empty, remove the launchCommand property
      form.unregister("launchCommand");
    }
  }, [launchCommand, form]);

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
