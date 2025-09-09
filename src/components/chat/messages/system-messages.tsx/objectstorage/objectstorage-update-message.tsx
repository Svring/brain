"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import BaseResourceMessage from "../components/base-resource-message";

// Form schema with Zod validation
const objectStorageUpdateFormSchema = z.object({
  policy: z.enum(["private", "publicRead", "publicReadWrite"]),
});

type ObjectStorageUpdateFormValues = z.infer<
  typeof objectStorageUpdateFormSchema
>;

interface ObjectStorageUpdateMessageProps {
  target: CustomResourceTarget;
}

export const ObjectStorageUpdateMessage: React.FC<
  ObjectStorageUpdateMessageProps
> = ({ target }) => {
  const { resource, isLoading, error } = useResourceStatus(target);

  // Initialize form with default values from resource or fallback
  const form = useForm<ObjectStorageUpdateFormValues>({
    resolver: zodResolver(objectStorageUpdateFormSchema),
    defaultValues: {
      policy: (resource as any)?.spec?.policy || "private",
    },
  });

  const getPolicyDisplayName = (policy: string) => {
    switch (policy) {
      case "private":
        return "Private";
      case "publicRead":
        return "Public Read";
      case "publicReadWrite":
        return "Public Read/Write";
      default:
        return policy;
    }
  };

  const getPolicyBadgeVariant = (policy: string) => {
    switch (policy) {
      case "private":
        return "secondary";
      case "publicRead":
        return "default";
      case "publicReadWrite":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading bucket information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Handle error state
  if (error || !resource) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load object storage information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  return (
    <BaseResourceMessage target={target}>
      <Form {...form}>
        <div className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Current Policy</FormLabel>
            <div className="flex items-center gap-2">
              <Badge
                variant={getPolicyBadgeVariant(form.watch("policy"))}
              >
                {getPolicyDisplayName(form.watch("policy"))}
              </Badge>
            </div>
          </div>

          <FormField
            control={form.control}
            name="policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Selection</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bucket policy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="publicRead">
                      Public Read
                    </SelectItem>
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
      </Form>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Object storage bucket policies can be configured here. Note that
          policy updates may require additional API support. The current
          selection reflects the desired policy configuration.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <FormLabel>Bucket Details</FormLabel>
        <div className="text-sm space-y-1">
          <div>
            <strong>Name:</strong> {target.name}
          </div>
          <div>
            <strong>Kind:</strong> {target.plural}
          </div>
        </div>
      </div>
    </BaseResourceMessage>
  );
};

export default ObjectStorageUpdateMessage;
