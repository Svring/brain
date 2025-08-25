import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import { LaunchpadFormValues } from "./types";

interface EnvironmentVariablesProps {
  form: UseFormReturn<LaunchpadFormValues>;
}

export function EnvironmentVariables({ form }: EnvironmentVariablesProps) {
  return (
    <AccordionItem
      value="env-vars"
      className="inset-ring inset-ring-border rounded-lg"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">Environment Variables</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <FormField
          control={form.control}
          name="envVars"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Environment Variables (one per line, KEY=VALUE)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="NODE_ENV=production&#10;DATABASE_URL=postgresql://..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
