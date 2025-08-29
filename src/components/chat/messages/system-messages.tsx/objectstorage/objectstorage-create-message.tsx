"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
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
import { Sparkles } from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import Image from "next/image";

// Policy options for object storage
export const bucketPolicyOptions = ["private", "publicRead", "publicReadWrite"] as const;

// Form schema with Zod validation
export const objectStorageFormSchema = z.object({
  name: z
    .string()
    .min(1, "Bucket name is required")
    .max(63, "Bucket name must be less than 63 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Bucket name must contain only lowercase letters, numbers, and hyphens"
    ),
  policy: z.enum(bucketPolicyOptions),
});

type ObjectStorageFormValues = z.infer<typeof objectStorageFormSchema>;

interface ObjectStorageCreatePayload {
  name?: string;
  policy?: "private" | "publicRead" | "publicReadWrite";
}

interface ObjectStorageCreateMessageProps {
  payload: ObjectStorageCreatePayload;
}

export const ObjectStorageCreateMessage: React.FC<
  ObjectStorageCreateMessageProps
> = ({ payload }) => {
  const [isCreating, setIsCreating] = useState(false);

  const { objectstorage, project } = useTRPCClients();
  const createObjectStorageMutation = useMutation(
    objectstorage.createObjectStorage.mutationOptions()
  );

  // Get selected project from context
  const { selectedProject } = useProjectState();

  // Initialize add to project mutation
  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => ({
    name: payload.name || "",
    policy: payload.policy || "private",
  }), [payload]);

  // Initialize form with default values
  const form = useForm<ObjectStorageFormValues>({
    resolver: zodResolver(objectStorageFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: ObjectStorageFormValues) => {
    if (!selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    setIsCreating(true);
    try {
      // Create the object storage bucket
      await createObjectStorageMutation.mutateAsync({
        bucketName: values.name.trim(),
        bucketPolicy: values.policy,
      });

      // Add the created object storage to the project
      const resourceTarget = convertResourceTypeToTarget("objectstoragebucket", values.name.trim());
      await addToProjectMutation.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });

      toast.success("Object storage bucket created and added to project successfully");
    } catch (error) {
      console.error("Failed to create object storage:", error);
      toast.error("Failed to create object storage bucket");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4 flex-col bg-background-secondary p-3 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <Image
              src="https://objectstorage.bja.sealos.run/logo.svg"
              alt="Object Storage Icon"
              width={36}
              height={36}
              className="w-full h-full object-cover p-1 rounded-lg"
            />
          </div>
        </div>
        <div className="flex items-center min-w-0 flex-1">
          <Input
            placeholder="Enter bucket name"
            value={form.watch("name")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue("name", e.target.value)}
            className="text-lg leading-tight bg-transparent h-9 border border-border"
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket Policy</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isCreating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bucket policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="publicRead">Public Read</SelectItem>
                      <SelectItem value="publicReadWrite">
                        Public Read/Write
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={isCreating}
              className="flex items-center"
            >
              <Sparkles className="h-4 w-4 text-theme-blue" />
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ObjectStorageCreateMessage;
