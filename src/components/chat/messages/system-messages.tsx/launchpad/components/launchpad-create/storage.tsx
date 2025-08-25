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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import { LaunchpadFormValues, storageSizeOptions } from "./types";

interface StorageProps {
  form: UseFormReturn<LaunchpadFormValues>;
}

export function Storage({ form }: StorageProps) {
  return (
    <AccordionItem
      value="storage"
      className="inset-ring inset-ring-border rounded-lg"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">Storage</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="storageName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Name</FormLabel>
                <FormControl>
                  <Input placeholder="Storage name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="storagePath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mount Path</FormLabel>
                <FormControl>
                  <Input placeholder="Mount path" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="storageSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageSizeOptions.map((sizeValue) => (
                        <SelectItem key={sizeValue} value={sizeValue}>
                          {sizeValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
