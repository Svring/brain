"use client";

import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import Image from "next/image";
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
import { EnvTable } from "@/components/chat/messages/system-messages.tsx/components/env-table";
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
    ...launchpad.create.mutationOptions(),
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
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <Image
              src="https://applaunchpad.bja.sealos.run/logo.svg"
              alt="App Launchpad Icon"
              width={36}
              height={36}
              className="w-full h-full object-cover p-1 rounded-lg"
            />
          </div>
        </div>
        <div className="flex items-center min-w-0 flex-1">
          <Input
            placeholder="Enter application name"
            value={form.watch("name")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue("name", e.target.value)
            }
            className="text-lg leading-tight bg-transparent h-9 border border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          {testMode && (
            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-md font-medium">
              TEST MODE
            </span>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ImageConfiguration form={form} />
          <ResourceConfiguration form={form} />

          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Ports</div>
            <PortsProtocol form={form} />
          </div>

          {/* Environment Variables Section */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Environment Variables
            </div>
            <EnvTable
              envVars={(form.watch("env") || []).map((env) => ({
                type: "value" as const,
                name: env.name,
                value: env.value || "",
              }))}
              allowEditing={true}
              onEnvVarsChange={(envVars) =>
                form.setValue(
                  "env",
                  envVars.map((env) => ({
                    name: env.name,
                    value: env.type === "value" ? env.value : "",
                  }))
                )
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={
                createLaunchpadMutation.isPending ||
                !form.watch("image")?.trim()
              }
              className="flex items-center"
            >
              <Sparkles className="h-4 w-4 text-theme-blue" />
              {createLaunchpadMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
