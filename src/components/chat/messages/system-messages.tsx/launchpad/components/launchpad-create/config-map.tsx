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
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import { LaunchpadFormValues } from "./types";

interface ConfigMapProps {
  form: UseFormReturn<LaunchpadFormValues>;
}

export function ConfigMap({ form }: ConfigMapProps) {
  return (
    <AccordionItem
      value="configmap"
      className="inset-ring inset-ring-border rounded-lg"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">ConfigMap</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="configMapPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Config Path</FormLabel>
                <FormControl>
                  <Input placeholder="Config path" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="configMapValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Config Value</FormLabel>
                <FormControl>
                  <Input placeholder="Config value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
