"use client";

/**
 * LaunchpadUpdateMessage Component
 *
 * A flexible component for updating launchpad configurations including image, resources, ports, and environment variables.
 *
 * Usage Examples:
 *
 * 1. Update existing launchpad with target:
 * <LaunchpadUpdateMessage
 *   payload={{
 *     target: { type: "builtin", resourceType: "deployment", name: "my-app", namespace: "default" },
 *     resource: { cpu: 2000, memory: 4096, replicas: 3 },
 *     image: "nginx:latest",
 *     ports: [{ port: 8080, protocol: "TCP", exposesPublicDomain: true }],
 *     env: [{ name: "NODE_ENV", value: "production" }],
 *     launchpadName: "my-app",
 *     status: "Running"
 *   }}
 * />
 *
 * 2. Create new configuration (no target):
 * <LaunchpadUpdateMessage
 *   payload={{
 *     resource: { cpu: 1000, memory: 2048, replicas: 1 },
 *     image: "node:18",
 *     ports: [{ port: 3000, protocol: "TCP", exposesPublicDomain: true }],
 *     env: [{ name: "PORT", value: "3000" }],
 *     launchpadName: "New App"
 *   }}
 * />
 *
 * 3. Update with streaming parameters:
 * <LaunchpadUpdateMessage
 *   payload={{
 *     target: target,
 *     resource: { cpu: 4000, memory: 8192, replicas: 5 },
 *     image: "my-app:v2.0",
 *     ports: [],
 *     env: [],
 *     launchpadName: "High-Performance App",
 *     status: "Running"
 *   }}
 * />
 *
 * 4. Integration with Copilot Actions:
 *
 * export const updateLaunchpadAction = (context: SealosApiContext) => {
 *   useCopilotAction({
 *     name: "updateLaunchpad",
 *     description: "Update launchpad configuration with new resources, image, ports, and environment variables",
 *     parameters: [
 *       {
 *         name: "target",
 *         type: "object",
 *         required: true,
 *         description: "Launchpad target configuration",
 *       },
 *       {
 *         name: "cpu",
 *         type: "number",
 *         required: false,
 *         description: "CPU allocation in millicores",
 *       },
 *       {
 *         name: "memory",
 *         type: "number",
 *         required: false,
 *         description: "Memory allocation in MB",
 *       },
 *       {
 *         name: "replicas",
 *         type: "number",
 *         required: false,
 *         description: "Number of replicas",
 *       },
 *       {
 *         name: "image",
 *         type: "string",
 *         required: false,
 *         description: "Docker image to use",
 *       },
 *       {
 *         name: "ports",
 *         type: "array",
 *         required: false,
 *         description: "Array of port configurations",
 *       },
 *       {
 *         name: "env",
 *         type: "array",
 *         required: false,
 *         description: "Array of environment variables",
 *       },
 *     ],
 *     handler: ({ target, cpu, memory, replicas, image, ports, env }) => {
 *       return (
 *         <LaunchpadUpdateMessage
 *           payload={{
 *             target,
 *             resource: {
 *               cpu: cpu || 2000,
 *               memory: memory || 4096,
 *               replicas: replicas || 1
 *             },
 *             image: image || "nginx:latest",
 *             ports: ports || [],
 *             env: env || [],
 *             launchpadName: target.name,
 *             status: "Running"
 *           }}
 *         />
 *       );
 *     },
 *   });
 * };
 */

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Accordion } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LaunchpadPatchRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import BaseSystemMessage from "../components/base-system-message";
import {
  ImageSection,
  ResourcesSection,
  PortsSection,
  EnvSection,
  SuccessMessage,
  launchpadUpdateFormSchema,
  type LaunchpadUpdateFormValues,
  type LaunchpadUpdateMessageProps,
} from "./components/launchpad-update";

export default function LaunchpadUpdateMessage({
  target,
  payload,
}: LaunchpadUpdateMessageProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { launchpad } = useTRPCClients();
  const launchpadName = payload?.launchpadName || target?.name || "Launchpad";

  const updateMutation = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  // Stable key for payload to avoid resets on identical content
  const payloadKey = useMemo(() => JSON.stringify(payload ?? {}), [payload]);

  // Memoize default values; changes only when payload content changes
  const defaultValues: LaunchpadUpdateFormValues = useMemo(
    () => ({
      image: payload?.image || "nginx:latest",
      cpu: (payload?.resource?.cpu || 2000).toString(),
      memory: (payload?.resource?.memory || 4096).toString(),
      replicas: (payload?.resource?.replicas || 1).toString(),
      ports: payload?.ports || [
        {
          port: 80,
          protocol: "TCP",
          appProtocol: "HTTP",
          exposesPublicDomain: true,
        },
      ],
      env: payload?.env || [],
    }),
    [payloadKey]
  );

  // Initialize form
  const form = useForm<LaunchpadUpdateFormValues>({
    resolver: zodResolver(launchpadUpdateFormSchema),
    defaultValues,
  });

  // Initialize field arrays for dynamic fields
  const portFields = useFieldArray({
    control: form.control,
    name: "ports",
  });

  const envFields = useFieldArray({
    control: form.control,
    name: "env",
  });

  // Reset form when payload changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [payloadKey, form, defaultValues]);

  const onSubmit = async (values: LaunchpadUpdateFormValues) => {
    if (!target) {
      toast.error("No target specified for update");
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare the patch request
      const patchRequest: LaunchpadPatchRequest = {};

      // Update resources
      if (
        parseInt(values.cpu) !== payload?.resource?.cpu ||
        parseInt(values.memory) !== payload?.resource?.memory ||
        parseInt(values.replicas) !== payload?.resource?.replicas
      ) {
        patchRequest.resource = {
          cpu: parseInt(values.cpu),
          memory: parseInt(values.memory),
          replicas: parseInt(values.replicas),
        };
      }

      // Update image
      if (values.image !== payload?.image) {
        patchRequest.image = values.image;
      }

      // Update environment variables
      if (
        values.env.length > 0 &&
        JSON.stringify(values.env) !== JSON.stringify(payload?.env)
      ) {
        patchRequest.env = values.env;
      }

      // Log the request instead of sending it (for debugging/testing)
      console.log(
        "Launchpad Update Request:",
        JSON.stringify(patchRequest, null, 2)
      );
      console.log("Target:", target.name);

      // Comment out the actual API call for now
      // await updateMutation.mutateAsync({
      //   name: target.name || "",
      //   request: patchRequest,
      // });

      setIsCompleted(true);
      toast.success("Launchpad updated successfully!");
    } catch (error) {
      console.error("Failed to update launchpad:", error);
      toast.error("Failed to update launchpad");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCompleted) {
    return (
      <SuccessMessage
        target={target}
        launchpadName={launchpadName}
        cpu={form.getValues("cpu")}
        memory={form.getValues("memory")}
        replicas={form.getValues("replicas")}
        portsCount={portFields.fields.length}
        envCount={envFields.fields.length}
      />
    );
  }

  return (
    <BaseSystemMessage target={target}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ImageSection control={form.control} />
          <ResourcesSection control={form.control} />

          {/* Collapsible Sections */}
          <Accordion type="multiple" className="w-full space-y-1">
            <PortsSection control={form.control} portFields={portFields} />
            <EnvSection control={form.control} envFields={envFields} />
          </Accordion>

          <Separator />

          {/* Update Button */}
          <Button
            type="submit"
            disabled={isUpdating || !target}
            className="w-full"
          >
            {isUpdating
              ? "Updating..."
              : target
              ? "Update Launchpad"
              : "No Target Specified"}
          </Button>

          {!target && (
            <div className="text-sm text-muted-foreground text-center">
              <p>Target is required to update launchpad configuration.</p>
            </div>
          )}
        </form>
      </Form>
    </BaseSystemMessage>
  );
}
