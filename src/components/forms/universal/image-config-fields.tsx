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
import { ImageConfig } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

export const ImageConfigFields = () => {
  const form = useFormContext<{ image: ImageConfig }>();

  return (
    <div className="space-y-4">
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
  );
};
