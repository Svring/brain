"use client";

import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { generateDeployName } from "@/lib/sealos/resources/deployment/deploy-utils";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { NameConfiguration } from "./components/universal/name-configuration";
import { ImageConfiguration } from "./components/universal/image-configuration";
import { ResourceConfiguration } from "./components/universal/resource-configuration";
import { CommandArgs } from "./components/universal/command-args";
import { PortsProtocol } from "./components/universal/ports-protocol";
import { EnvironmentVariables } from "./components/universal/environment-variables";
import { ConfigMap } from "./components/universal/config-map";
import { Storage } from "./components/universal/storage";
import { SuccessState } from "./components/launchpad-create/success-state";
import {
  LaunchpadCreateRequestSchema,
  LaunchpadCreateRequest,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface DeploymentCreateMessageProps {
  payload?: LaunchpadCreateRequest;
  testMode?: boolean;
  defaultOpenSections?: {
    commandArgs?: boolean;
    portsProtocol?: boolean;
    environmentVariables?: boolean;
    configMap?: boolean;
    storage?: boolean;
  };
}

export default function LaunchpadCreateMessage({
  payload,
  testMode = false,
  defaultOpenSections = {},
}: DeploymentCreateMessageProps) {
  const { launchpad, project } = useTRPCClients();
  const { selectedProject } = useProjectState();

  const formValues = useMemo(() => {
    return payload
      ? LaunchpadCreateRequestSchema.parse(payload)
      : LaunchpadCreateRequestSchema.parse({});
  }, [payload]);

  const form = useForm<LaunchpadCreateRequest>({
    resolver: zodResolver(LaunchpadCreateRequestSchema),
    defaultValues: formValues,
  });

  useEffect(() => {
    form.reset(formValues);
  }, [formValues, form]);

  const createLaunchpadMutation = useMutation({
    ...launchpad.createLaunchpad.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (!testMode) {
        if (!selectedProject) {
          toast.error("No project selected. Please select a project first.");
          return;
        }
        const resourceTarget = convertResourceTypeToTarget(
          "deployment",
          variables.request.name
        );
        await addToProjectMutation.mutateAsync({
          resources: [resourceTarget],
          name: selectedProject,
        });
        toast.success(
          "Launchpad application created and added to project successfully!"
        );
      } else {
        toast.success(
          `Test Mode: Would create launchpad application "${variables.request.name}"`
        );
        console.log("values", form.getValues());
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create launchpad application");
    },
  });

  const addToProjectMutation = useMutation({
    ...project.addToProject.mutationOptions(),
    onError: (error: any) => {
      toast.error(error.message || "Failed to add application to project");
    },
  });

  const onSubmit = async (values: LaunchpadCreateRequest) => {
    if (!values.image.trim()) {
      toast.error("Please enter an image");
      return;
    }

    if (!testMode && !selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    const deploymentName = values.name.trim() || generateDeployName();
    await createLaunchpadMutation.mutateAsync({
      request: { ...values, name: deploymentName },
    });
  };

  if (
    createLaunchpadMutation.isSuccess &&
    createLaunchpadMutation.variables?.request.name &&
    !testMode
  ) {
    return (
      <SuccessState
        createdDeploymentName={createLaunchpadMutation.variables.request.name}
        form={form}
      />
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
            <NameConfiguration form={form} />
            <ImageConfiguration form={form} />
            <ResourceConfiguration form={form} />
            <Accordion 
              type="multiple" 
              className="w-full space-y-1"
              defaultValue={[
                ...(defaultOpenSections.commandArgs ? ['command-args'] : []),
                ...(defaultOpenSections.portsProtocol ? ['ports-protocol'] : []),
                ...(defaultOpenSections.environmentVariables ? ['env-vars'] : []),
                ...(defaultOpenSections.configMap ? ['configmap'] : []),
                ...(defaultOpenSections.storage ? ['storage'] : []),
              ]}
            >
              <CommandArgs form={form} />
              <PortsProtocol form={form} />
              <EnvironmentVariables form={form} />
              <ConfigMap form={form} />
              <Storage form={form} />
            </Accordion>
            <Button
              type="submit"
              disabled={
                createLaunchpadMutation.isPending ||
                !form.watch("image")?.trim()
              }
              className="w-full"
            >
              {createLaunchpadMutation.isPending
                ? "Creating..."
                : "Create Launchpad Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
