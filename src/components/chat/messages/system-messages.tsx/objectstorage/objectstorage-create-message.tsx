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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// Policy options for object storage
const policyOptions = ["private", "publicRead", "publicReadWrite"] as const;

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
  policy: z.enum(policyOptions),
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
    <Card className="w-full bg-background-secondary">
      <CardHeader>
        <CardTitle>Create Object Storage Bucket</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter bucket name"
                      disabled={isCreating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Bucket"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ObjectStorageCreateMessage;
