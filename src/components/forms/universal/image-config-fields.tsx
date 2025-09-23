"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";
import { Image } from "@/schemas/forms/launchpad/components/launchpad-image-schema";
import { useEffect } from "react";

interface ImageConfigFieldsProps {
  hidePrivateRegistry?: boolean;
}

export const ImageConfigFields = ({
  hidePrivateRegistry = false,
}: ImageConfigFieldsProps) => {
  const form = useFormContext<{ image: Image }>();

  // Watch for changes in image registry fields and clean up when empty
  const imageRegistry = form.watch("image.imageRegistry");
  const isPrivateRegistry = !!imageRegistry;

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

  const handlePrivateRegistryToggle = (checked: boolean) => {
    if (checked) {
      // Initialize registry object with empty values
      form.setValue("image.imageRegistry", {
        username: "",
        password: "",
        serverAddress: "",
      });
    } else {
      // Clear the entire registry object
      form.setValue("image.imageRegistry", null);
    }
  };

  return (
    <div
      className={`${
        hidePrivateRegistry ? "" : "border border-dashed rounded-lg p-4"
      } space-y-4`}
    >
      <FormField
        control={form.control}
        name="image.imageName"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Image Name</FormLabel>
              {!hidePrivateRegistry && (
                <FormField
                  control={form.control}
                  name="image.imageRegistry"
                  render={() => (
                    <FormItem className="flex flex-row items-center">
                      <FormControl>
                        <Checkbox
                          checked={isPrivateRegistry}
                          onCheckedChange={handlePrivateRegistryToggle}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Private
                      </FormLabel>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormControl>
              <Input placeholder="nginx:latest" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Private Registry Fields - Show when checkbox is checked and not hidden */}
      {!hidePrivateRegistry && isPrivateRegistry && (
        <div className="space-y-4 pl-4 border-l-2 border-muted">
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
  );
};
