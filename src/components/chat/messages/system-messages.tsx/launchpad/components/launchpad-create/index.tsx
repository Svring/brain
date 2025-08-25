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
  launchpadFormSchema,
  LaunchpadFormValues,
  DeploymentCreateMessageProps,
} from "./types";

export default function LaunchpadCreateMessage({
  payload,
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
  const defaultValues: LaunchpadFormValues = useMemo(
    () => ({
      name: payload?.name || generateDeployName(),
      image: payload?.image || "nginx",
      command: payload?.command || "",
      args: payload?.args || "",
      cpu: (payload?.cpu || 500).toString(),
      memory: (payload?.memory || 512).toString(),
      replicas: (payload?.replicas || 1).toString(),
      ports: [
        {
          port: 80,
          protocol: "TCP",
          appProtocol: undefined,
          exposesPublicDomain: true,
        },
      ],
      envVars: payload?.envVars || "",
      storageName: payload?.storageName || "",
      storagePath: payload?.storagePath || "",
      storageSize: (payload?.storageSize as any) || "1Gi",
      configMapPath: payload?.configMapPath || "",
      configMapValue: payload?.configMapValue || "",
    }),
    [payloadKey]
  );

  // Initialize form
  const form = useForm<LaunchpadFormValues>({
    resolver: zodResolver(launchpadFormSchema),
    defaultValues,
  });

  // Reset form when payload changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [payloadKey, form, defaultValues]);

  const onSubmit = async (values: LaunchpadFormValues) => {
    const deploymentName = values.name.trim() || generateDeployName();

    if (!values.image.trim()) {
      toast.error("Please enter an image");
      return;
    }

    if (!selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    setIsCreating(true);
    try {
      // Parse environment variables
      const envArray = (values.envVars || "")
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => {
          const [key, ...valueParts] = line.split("=");
          return {
            name: key.trim(),
            value: valueParts.join("=").trim(),
          };
        });

      // Build storage array
      const storageArray =
        values.storageName && values.storagePath
          ? [
              {
                name: values.storageName,
                path: values.storagePath,
                size: values.storageSize,
              },
            ]
          : [];

      // Build configMap array
      const configMapArray = values.configMapPath
        ? [
            {
              path: values.configMapPath,
              value: values.configMapValue,
            },
          ]
        : [];

      // Create the launchpad application using the new standardized API
      const createRequest = {
        name: deploymentName,
        image: values.image.trim(),
        command: (values.command || "").trim(),
        args: (values.args || "").trim(),
        resource: {
          replicas: parseInt(values.replicas),
          cpu: parseInt(values.cpu),
          memory: parseInt(values.memory),
        },
        ports: values.ports.map((port) => ({
          port: port.port,
          protocol: port.appProtocol ? "TCP" : port.protocol,
          appProtocol: port.appProtocol,
          exposesPublicDomain: port.exposesPublicDomain,
        })),
        env: envArray,
        hpa: null,
        imageRegistry: null,
        storage: storageArray,
        configMap: configMapArray,
      };

      // Log the request instead of sending it (for debugging/testing)
      console.log(
        "Launchpad Create Request:",
        JSON.stringify(createRequest, null, 2)
      );

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
        <CardTitle className="text-lg">Create Launchpad Application</CardTitle>
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
