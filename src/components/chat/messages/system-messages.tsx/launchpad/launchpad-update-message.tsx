"use client";

import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Accordion } from "@/components/ui/accordion";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { NameConfiguration } from "./components/universal/name-configuration";
import { ImageConfiguration } from "./components/universal/image-configuration";
import { ResourceConfiguration } from "./components/universal/resource-configuration";
import { CommandArgs } from "./components/universal/command-args";
import { EnvironmentVariables } from "./components/universal/environment-variables";
import { SuccessState } from "./components/launchpad-create/success-state";
import BaseSystemMessage from "../components/base-system-message";
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

    // Merge command and args
    const mergedCommand =
      updateRequest.command !== undefined
        ? updateRequest.command
        : currentLaunchpad.command;

    const mergedArgs =
      updateRequest.args !== undefined
        ? updateRequest.args
        : currentLaunchpad.args;

    // Merge image
    const mergedImage =
      updateRequest.image !== undefined
        ? updateRequest.image
        : currentLaunchpad.image;

    console.log("mergedResource", {
      resource: mergedResource,
      env: mergedEnv,
      command: mergedCommand,
      args: mergedArgs,
      image: mergedImage,
    });

    return LaunchpadUpdateRequestSchema.parse({
      resource: mergedResource,
      env: mergedEnv,
      command: mergedCommand,
      args: mergedArgs,
      image: mergedImage,
    });
  }, [currentResource, payload]);

  const form = useForm<LaunchpadUpdateRequest>({
    resolver: zodResolver(LaunchpadUpdateRequestSchema),
    defaultValues: formValues,
  });

  useEffect(() => {
    if (!isLoadingResource) {
      form.reset(formValues);
    }
  }, [formValues, form, isLoadingResource]);

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
        console.log("values", form.getValues());
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update launchpad application");
    },
  });

  const onSubmit = async (values: LaunchpadUpdateRequest) => {
    if (!target?.name) {
      toast.error("No target specified for update");
      return;
    }

    await updateLaunchpadMutation.mutateAsync({
      name: target.name,
      request: values,
    });
  };

  if (updateLaunchpadMutation.isSuccess && target?.name && !testMode) {
    return (
      <SuccessState createdDeploymentName={target.name} form={form as any} />
    );
  }

  // Show loading state while fetching current resource
  if (isLoadingResource) {
    return (
      <BaseSystemMessage target={target}>
        <div className="text-center py-4 text-muted-foreground">
          Loading current resource data...
        </div>
      </BaseSystemMessage>
    );
  }

  // Determine which sections to show based on formValues
  const hasResource = !!formValues.resource;
  const hasImage = !!formValues.image;
  const hasCommand = !!formValues.command || !!formValues.args;
  const hasEnv = !!formValues.env && formValues.env.length > 0;

  return (
    <BaseSystemMessage target={target}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Show individual configuration components based on available fields */}
          {hasImage && <ImageConfiguration form={form as any} />}
          {hasResource && <ResourceConfiguration form={form as any} />}

          {/* Only show CommandArgs if we have command or args */}
          {hasCommand && (
            <Accordion
              type="multiple"
              className="w-full space-y-1"
              defaultValue={["command-args"]}
            >
              <CommandArgs form={form as any} />
            </Accordion>
          )}

          {/* Only show EnvironmentVariables if we have env */}
          {hasEnv && (
            <Accordion
              type="multiple"
              className="w-full space-y-1"
              defaultValue={["env-vars"]}
            >
              <EnvironmentVariables form={form as any} />
            </Accordion>
          )}

          {/* Show button if we have any fields to update */}
          {(hasResource || hasImage || hasCommand || hasEnv) && (
            <Button
              type="submit"
              disabled={updateLaunchpadMutation.isPending || !target?.name}
              className="w-full"
            >
              {updateLaunchpadMutation.isPending
                ? "Updating..."
                : "Update Launchpad Application"}
            </Button>
          )}

          {/* Show message if no fields provided */}
          {!hasResource && !hasImage && !hasCommand && !hasEnv && (
            <div className="text-center py-4 text-muted-foreground">
              No update fields provided. Please specify resource, image,
              command, or environment variables to update.
            </div>
          )}
        </form>
      </Form>
    </BaseSystemMessage>
  );
}
