"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { Hpa } from "@/schemas/forms/universal/hpa-schema";

export const HpaFields = () => {
  const form = useFormContext<{ resource: { hpa: Hpa } }>();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="resource.hpa.target"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Resource</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select target resource" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cpu">CPU</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="gpu">GPU</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="resource.hpa.value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Value (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="70"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="resource.hpa.minReplicas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Replicas</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resource.hpa.maxReplicas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Replicas</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
