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
import { Image } from "@/schemas/forms/launchpad/components/image-schema";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export const ImageConfigFields = () => {
  const form = useFormContext<{ image: Image }>();
  const [isRegistryExpanded, setIsRegistryExpanded] = useState(false);

  return (
    <div className="border border-dashed rounded-lg p-4 space-y-4">
      <FormField
        control={form.control}
        name="image.imageName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image Name</FormLabel>
            <FormControl>
              <Input placeholder="nginx:latest" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Private Registry - Collapsible */}
      <div className="border border-dashed rounded-lg">
        <div
          className="flex items-center justify-between p-2 border-b border-dashed cursor-pointer transition-colors"
          onClick={() => setIsRegistryExpanded(!isRegistryExpanded)}
          title="Click to toggle private registry configuration"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center">
              {isRegistryExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
            <h3 className="font-medium">Private Registry</h3>
          </div>
        </div>

        {isRegistryExpanded && (
          <div className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="image.imageRegistry.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registry Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image.imageRegistry.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registry Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image.imageRegistry.serverAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Address</FormLabel>
                  <FormControl>
                    <Input placeholder="registry.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
