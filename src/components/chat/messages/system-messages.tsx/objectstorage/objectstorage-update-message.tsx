"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

// Form schema with Zod validation
const objectStorageUpdateFormSchema = z.object({
  policy: z.enum(["private", "publicRead", "publicReadWrite"]),
});

type ObjectStorageUpdateFormValues = z.infer<typeof objectStorageUpdateFormSchema>;

interface ObjectStorageUpdatePayload {
  policy?: "private" | "publicRead" | "publicReadWrite";
}

interface ObjectStorageUpdateMessageProps {
  target: CustomResourceTarget;
  payload: ObjectStorageUpdatePayload;
}

export const ObjectStorageUpdateMessage: React.FC<ObjectStorageUpdateMessageProps> = ({
  target,
  payload,
}) => {
  const { objectstorage } = useTRPCClients();

  const { data: objectstorageObject, isLoading } = useQuery(
    objectstorage.getObjectStorage.queryOptions({
      target,
    })
  );

  // Initialize form with default values
  const form = useForm<ObjectStorageUpdateFormValues>({
    resolver: zodResolver(objectStorageUpdateFormSchema),
    defaultValues: {
      policy: payload.policy || "private",
    },
  });

  // Update form values when payload changes
  useEffect(() => {
    if (payload.policy !== undefined) {
      form.setValue("policy", payload.policy);
    }
  }, [payload, form]);

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

  return (
    <Card className="w-full bg-node-background">
      <CardHeader>
        <CardTitle>Object Storage Bucket Policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading bucket information...</div>
        ) : (
          <>
            <Form {...form}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Current Policy</FormLabel>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPolicyBadgeVariant(form.watch("policy"))}>
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
                          <SelectItem value="publicRead">Public Read</SelectItem>
                          <SelectItem value="publicReadWrite">Public Read/Write</SelectItem>
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
                Object storage bucket policies can be configured here. Note that policy updates may require 
                additional API support. The current selection reflects the desired policy configuration.
              </AlertDescription>
            </Alert>

            {objectstorageObject && (
              <div className="space-y-2">
                <Label>Bucket Details</Label>
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {target.name}</div>
                  <div><strong>Kind:</strong> {target.plural}</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ObjectStorageUpdateMessage;
