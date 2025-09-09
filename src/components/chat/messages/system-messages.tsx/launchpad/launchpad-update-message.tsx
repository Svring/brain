"use client";

import React, { useMemo } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import BaseResourceMessage from "../components/base-resource-message";
import {
  LaunchpadUpdateRequestSchema,
  LaunchpadUpdateRequest,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-update-schema";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";

interface LaunchpadUpdateMessageProps {
  target?: BuiltinResourceTarget;
  payload?: LaunchpadUpdateRequest;
  testMode?: boolean;
}

export default function LaunchpadUpdateMessage({
  target,
  payload,
  testMode = false,
}: LaunchpadUpdateMessageProps) {
  const { launchpad } = useTRPCClients();

  // Get current resource data
  const { resource: currentResource, isLoading: isLoadingResource } =
    useResourceStatus(target!);

  console.log("currentResource", currentResource);

  // Merge update request with current resource data
  const formValues = useMemo(() => {
    if (!currentResource) {
      return payload
        ? LaunchpadUpdateRequestSchema.parse(payload)
        : LaunchpadUpdateRequestSchema.parse({});
    }

    const currentLaunchpad = currentResource as LaunchpadObject;
    const updateRequest = payload || {};

    // Merge resource data
    const mergedResource = {
      ...currentLaunchpad.resource,
      ...updateRequest.resource,
    };

    // Merge environment variables
    const mergedEnv =
      updateRequest.env !== undefined
        ? updateRequest.env
        : currentLaunchpad.env || [];

    // Merge image
    const mergedImage =
      updateRequest.image !== undefined
        ? updateRequest.image
        : currentLaunchpad.image;

    console.log("mergedResource", {
      resource: mergedResource,
      env: mergedEnv,
      image: mergedImage,
    });

    return LaunchpadUpdateRequestSchema.parse({
      resource: mergedResource,
      env: mergedEnv,
      image: mergedImage,
    });
  }, [currentResource, payload]);

  const updateLaunchpadMutation = useMutation({
    ...launchpad.updateLaunchpad.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (!testMode) {
        toast.success(
          `Launchpad application "${target?.name}" updated successfully!`
        );
      } else {
        toast.success(
          `Test Mode: Would update launchpad application "${target?.name}"`
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update launchpad application");
    },
  });

  const handleSubmit = async (values: LaunchpadUpdateRequest) => {
    if (!target?.name) {
      toast.error("No target specified for update");
      return;
    }

    await updateLaunchpadMutation.mutateAsync({
      name: target.name,
      request: values,
    });
  };

  // Show loading state while fetching current resource
  if (isLoadingResource) {
    return (
      <BaseResourceMessage target={target}>
        <div className="text-center py-4 text-muted-foreground">
          Loading current resource data...
        </div>
      </BaseResourceMessage>
    );
  }

  // Determine which sections to show based on formValues
  const hasResource = !!formValues.resource;
  const hasImage = !!formValues.image;
  const hasEnv = !!formValues.env && formValues.env.length > 0;

  // Show message if no fields provided
  if (!hasResource && !hasImage && !hasEnv) {
    return (
      <BaseResourceMessage target={target}>
        <div className="text-center py-4 text-muted-foreground">
          No update fields provided. Please specify resource, image, or
          environment variables to update.
        </div>
      </BaseResourceMessage>
    );
  }

  return (
    <BaseResourceMessage target={target}>
      <div className="space-y-3 flex-col p-3 rounded-xl">
        <LaunchpadUpdateForm
          defaultValues={formValues}
          onSubmit={handleSubmit}
          isLoading={updateLaunchpadMutation.isPending}
        />
      </div>
    </BaseResourceMessage>
  );
}
