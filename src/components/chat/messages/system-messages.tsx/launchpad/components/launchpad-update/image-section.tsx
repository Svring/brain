import React from "react";
import { Control } from "react-hook-form";
import { Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import type { LaunchpadUpdateFormValues } from "./types";

interface ImageSectionProps {
  control: Control<LaunchpadUpdateFormValues>;
}

export function ImageSection({ control }: ImageSectionProps) {
  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <Label className="text-sm font-medium">Container Image</Label>
        </div>
        <FormField
          control={control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="nginx:latest"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Separator />
    </>
  );
}
