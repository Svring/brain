"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Image } from "@/schemas/forms/universal/image-schema";

export const ImageField = () => {
  const form = useFormContext<{ image: Image }>();

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Container Image</FormLabel>
          <FormControl>
            <Input 
              placeholder="nginx:latest" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};


