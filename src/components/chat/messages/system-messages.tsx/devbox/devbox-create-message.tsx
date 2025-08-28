"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { generateDevboxName } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { DEVBOX_RUNTIME_ICONS } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { RuntimeConfiguration } from "./components/universal/runtime-configuration";
import { ResourceConfiguration } from "./components/universal/resource-configuration";
import { PortsProtocol } from "./components/universal/ports-protocol";
import { SuccessState } from "./components/devbox-create/success-state";
import {
  DevboxCreateSchema,
  DevboxCreate,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-mutation-schema";

interface DevboxCreateMessageProps {
  payload?: {
    name?: string;
    runtimeName?: string;
    cpu?: number;
    memory?: number;
    ports?: string;
  };
  testMode?: boolean;
}

export default function DevboxCreateMessage({
  payload,
  testMode = false,
}: DevboxCreateMessageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdDevboxName, setCreatedDevboxName] = useState<string>("");
  const { devbox, project } = useTRPCClients();
  const { selectedProject } = useProjectState();

  // Initialize add to project mutation
  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  // Stable key for payload to avoid resets on identical content
  const payloadKey = useMemo(() => JSON.stringify(payload ?? {}), [payload]);

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues: DevboxCreate = useMemo(
    () => ({
      name: payload?.name || generateDevboxName(),
      runtime: {
        template: payload?.runtimeName || "Node.js",
        version: "latest",
      },
      resource: {
        cpu: (payload?.cpu || 500).toString(),
        memory: (payload?.memory || 512).toString(),
      },
      ports: [
        {
          number: 8080,
          protocol: "HTTPS",
          public: false,
        },
      ],
    }),
    [payloadKey]
  );

  console.log("payload", payload);

  // Initialize form
  const form = useForm<DevboxCreate>({
    resolver: zodResolver(DevboxCreateSchema),
    defaultValues,
  });

  // Reset form when payload changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [payloadKey, form, defaultValues]);

  const createDevboxMutation = useMutation({
    ...devbox.createDevbox.mutationOptions(),
    onSuccess: async (_, variables) => {
      if (!testMode) {
        if (!selectedProject) {
          toast.error("No project selected. Please select a project first.");
          return;
        }
        const resourceTarget = convertResourceTypeToTarget(
          "devbox",
          variables.name
        );
        await addToProjectMutation.mutateAsync({
          resources: [resourceTarget],
          name: selectedProject,
        });
        setCreatedDevboxName(variables.name);
        setIsCompleted(true);
        toast.success("Devbox created and added to project successfully!");
      } else {
        toast.success(`Test Mode: Would create devbox "${variables.name}"`);
        console.log("values", form.getValues());
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create devbox");
    },
  });

  const onSubmit = async (values: DevboxCreate) => {
    const devboxName = values.name.trim() || generateDevboxName();

    if (!testMode && !selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    setIsCreating(true);
    try {
      await createDevboxMutation.mutateAsync({
        name: devboxName,
        runtimeName: values.runtime.template as any,
        cpu: parseInt(values.resource.cpu),
        memory: parseInt(values.resource.memory),
        // ports: values.ports,
      });
    } catch (error) {
      console.error("Failed to create devbox:", error);
      toast.error("Failed to create devbox. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isCompleted) {
    return <SuccessState createdDevboxName={createdDevboxName} form={form} />;
  }

  return (
    <div className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <img
              src={
                DEVBOX_RUNTIME_ICONS[
                  form.watch(
                    "runtime.template"
                  ) as keyof typeof DEVBOX_RUNTIME_ICONS
                ] || "https://devbox.bja.sealos.run/logo.svg"
              }
              alt={`${form.watch("runtime.template")} Icon`}
              className="w-full h-full object-cover p-1"
            />
          </div>
        </div>
        <div className="flex items-center min-w-0 flex-1">
          <Input
            placeholder="Enter devbox name"
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
          <RuntimeConfiguration form={form} />
          <ResourceConfiguration form={form} />
          <PortsProtocol form={form} />

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
}
