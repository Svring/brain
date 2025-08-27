"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { generateDeployName } from "@/lib/sealos/resources/deployment/deploy-utils";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// Import all the split components
import { BasicConfiguration } from "./basic-configuration";
import { CommandArgs } from "./command-args";
import { PortsProtocol } from "./ports-protocol";
import { EnvironmentVariables } from "./environment-variables";
import { ConfigMap } from "./config-map";
import { Storage } from "./storage";
import { SuccessState } from "./success-state";
import {
  LaunchpadCreateRequestSchema,
  LaunchpadCreateRequest,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface DeploymentCreateMessageProps {
  payload?: LaunchpadCreateRequest;
  testMode?: boolean;
}

export default function LaunchpadCreateMessage({
  payload,
  testMode = false,
}: DeploymentCreateMessageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdDeploymentName, setCreatedDeploymentName] =
    useState<string>("");

  const { launchpad, project } = useTRPCClients();
  const createLaunchpadMutation = useMutation(
    launchpad.createLaunchpad.mutationOptions()
  );

  // Get selected project from context
  const { selectedProject } = useProjectState();

  // Initialize add to project mutation
  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  // Stable key for payload to avoid resets on identical content
  const payloadKey = useMemo(() => JSON.stringify(payload ?? {}), [payload]);

  // Memoize default values; changes only when payload content changes
  const defaultValues: LaunchpadCreateRequest = useMemo(() => {
    // Use schema defaults and merge with payload
    const schemaDefaults = LaunchpadCreateRequestSchema.parse({});
    return {
      ...schemaDefaults,
      ...payload,
      name: payload?.name || generateDeployName(),
    };
  }, [payloadKey]);

  // Initialize form
  const form = useForm<LaunchpadCreateRequest>({
    resolver: zodResolver(LaunchpadCreateRequestSchema),
    defaultValues,
  });

  // Reset form when payload changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [payloadKey, form, defaultValues]);

  const onSubmit = async (values: LaunchpadCreateRequest) => {
    const deploymentName = values.name.trim() || generateDeployName();

    if (!values.image.trim()) {
      toast.error("Please enter an image");
      return;
    }

    // if (!selectedProject) {
    //   toast.error("No project selected. Please select a project first.");
    //   return;
    // }

    setIsCreating(true);
    try {
      // Create the launchpad application using the new standardized API
      // The form values already match the API request structure, just update the name
      const createRequest = {
        ...values,
        name: deploymentName,
      };

      // Log the request instead of sending it (for debugging/testing)
      console.log(
        "Launchpad Create Request:",
        JSON.stringify(createRequest, null, 2)
      );

      if (!testMode) {
        // Comment out the actual API call for now
        // await createLaunchpadMutation.mutateAsync({
        //   request: createRequest,
        // });

        // Add the created deployment to the project (commented out for debugging)
        // const resourceTarget = convertResourceTypeToTarget(
        //   "deployment",
        //   deploymentName
        // );
        // await addToProjectMutation.mutateAsync({
        //   resources: [resourceTarget],
        //   name: selectedProject,
        // });

        // Set completion state
        setCreatedDeploymentName(deploymentName);
        setIsCompleted(true);
        toast.success(
          "Launchpad application created and added to project successfully!"
        );
      } else {
        // In test mode, just show success toast without completing
        toast.success(
          `Test Mode: Would create launchpad application "${deploymentName}"`
        );
      }
    } catch (error) {
      console.error("Failed to create launchpad application:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isCompleted) {
    return (
      <SuccessState createdDeploymentName={createdDeploymentName} form={form} />
    );
  }

  return (
    <Card className="w-full bg-background-secondary border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Create Launchpad Application
          {testMode && (
            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-md font-medium">
              TEST MODE
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Configuration - Always Visible */}
            <BasicConfiguration form={form} />

            {/* Collapsible Sections */}
            <Accordion type="multiple" className="w-full space-y-1">
              <CommandArgs form={form} />
              <PortsProtocol form={form} />
              <EnvironmentVariables form={form} />
              <ConfigMap form={form} />
              <Storage form={form} />
            </Accordion>

            <Button
              type="submit"
              disabled={isCreating || !form.watch("image")?.trim()}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Launchpad Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
