"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { Image } from "@/schemas/forms/launchpad/components/launchpad-image-schema";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";

export const ImageConfigFields = () => {
  const form = useFormContext<{ image: Image }>();
  const [isRegistryExpanded, setIsRegistryExpanded] = useState(false);

  // Watch for changes in image registry fields and clean up when empty
  const imageRegistry = form.watch("image.imageRegistry");
  
  useEffect(() => {
    if (imageRegistry) {
      const { username, password, serverAddress } = imageRegistry;
      // If all registry fields are empty, remove the imageRegistry property
      if (!username && !password && !serverAddress) {
        const currentImage = form.getValues("image");
        const { imageRegistry: _, ...imageWithoutRegistry } = currentImage;
        form.setValue("image", imageWithoutRegistry);
      }
    }
  }, [imageRegistry, form]);

  const clearRegistryData = () => {
    // Clear the entire registry object
    form.setValue("image.imageRegistry", null);
    // Also clear individual fields to ensure they show empty
    form.setValue("image.imageRegistry.username", "");
    form.setValue("image.imageRegistry.password", "");
    form.setValue("image.imageRegistry.serverAddress", "");
  };

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
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Registry Configuration</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearRegistryData}
                className="h-8 w-8 p-0"
                title="Clear registry data"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name="image.imageRegistry.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registry Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="username" 
                      value={field.value || ""} 
                      onChange={field.onChange}
                    />
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
                    <Input 
                      type="password" 
                      placeholder="password" 
                      value={field.value || ""} 
                      onChange={field.onChange}
                    />
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
                    <Input 
                      placeholder="registry.example.com" 
                      value={field.value || ""} 
                      onChange={field.onChange}
                    />
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
