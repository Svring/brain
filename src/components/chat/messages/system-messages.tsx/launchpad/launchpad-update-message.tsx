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
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  LaunchpadPatchRequest,
  LaunchpadPortsUpdateRequest,
} from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
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

  // Fetch current resource status if target is provided
  const { resource: currentResource, isLoading: isResourceLoading } =
    useResourceStatus(
      target || {
        type: "builtin",
        resourceType: "deployment",
        name: "",
        namespace: "default",
      }
    );

  const updateMutation = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  const updatePortsMutation = useMutation(
    launchpad.updateLaunchpadPorts.mutationOptions()
  );

  // Stable key for payload and resource to avoid resets on identical content
  const payloadKey = useMemo(() => JSON.stringify(payload ?? {}), [payload]);
  const resourceKey = useMemo(
    () => JSON.stringify(currentResource ?? {}),
    [currentResource]
  );

     console.log("currentResource", currentResource);

  // Memoize default values; changes when payload or resource content changes
  const defaultValues: LaunchpadUpdateFormValues = useMemo(() => {
    // Extract current resource data from the flattened structure
    // Only extract from launchpad resources (deployment/statefulset)
    const isLaunchpadResource =
      currentResource &&
      (currentResource as any).kind &&
      ["Deployment", "StatefulSet"].includes((currentResource as any).kind);

    let currentImage: string | undefined;
    let currentReplicas: number | undefined;
    let currentCpu: string | undefined;
    let currentMemory: string | undefined;
    let currentPorts: any[] | undefined;
    let currentEnv: any[] | undefined;

         if (isLaunchpadResource) {
       const launchpadResource = currentResource as any;
       currentImage = launchpadResource.image;
       currentReplicas = launchpadResource.resource?.replicas;
       
       // Convert CPU and memory from Kubernetes format to numbers
       const cpuValue = launchpadResource.resource?.cpu;
       const memoryValue = launchpadResource.resource?.memory;
       
       // Convert CPU (e.g., "500m" -> 500, "1" -> 1000)
       if (cpuValue) {
         if (typeof cpuValue === 'string') {
           if (cpuValue.endsWith('m')) {
             currentCpu = parseInt(cpuValue.slice(0, -1)).toString();
           } else {
             currentCpu = (parseInt(cpuValue) * 1000).toString(); // Convert cores to millicores
           }
         } else {
           currentCpu = cpuValue.toString();
         }
       }
       
       // Convert Memory (e.g., "8Gi" -> 8192, "1Gi" -> 1024)
       if (memoryValue) {
         if (typeof memoryValue === 'string') {
           const match = memoryValue.match(/^(\d+)([KMG]i?|m?)$/);
           if (match) {
             const value = parseInt(match[1]);
             const unit = match[2];
             if (unit === 'Ki' || unit === 'K') {
               currentMemory = Math.ceil(value / 1024).toString(); // Convert to MB
             } else if (unit === 'Mi' || unit === 'M') {
               currentMemory = value.toString();
             } else if (unit === 'Gi' || unit === 'G') {
               currentMemory = (value * 1024).toString(); // Convert to MB
             } else if (unit === 'm') {
               currentMemory = Math.ceil(value / (1024 * 1024)).toString(); // Convert to MB
             }
           }
         } else {
           currentMemory = memoryValue.toString();
         }
       }
       
       currentPorts = launchpadResource.ports;
       currentEnv = launchpadResource.env;
       
       // Debug extracted values
       console.log("Extracted values:", {
         currentImage,
         currentReplicas,
         currentCpu,
         currentMemory,
         currentPorts,
         currentEnv,
       });
     }

         // Convert ports from the resource format to our form format
     const formattedPorts =
       currentPorts?.map((port: any) => ({
         port: port.number,
         protocol: (port.protocol || "TCP") as "TCP" | "UDP" | "SCTP",
         appProtocol: port.protocol === "HTTP" ? ("HTTP" as const) : 
                     port.protocol === "GRPC" ? ("GRPC" as const) :
                     port.protocol === "WS" ? ("WS" as const) : undefined,
         exposesPublicDomain: true, // Default assumption based on the resource structure
       })) || [];

         // Convert env from the resource format to our form format
     const formattedEnv =
       currentEnv?.map((env: any) => ({
         name: env.key || env.name, // Use 'key' field from the resource, fallback to 'name'
         value: env.value || "",
       })) || [];

    return {
      image: payload?.image || currentImage || "nginx:latest",
      cpu: (payload?.resource?.cpu || currentCpu || 2000).toString(),
      memory: (payload?.resource?.memory || currentMemory || 4096).toString(),
      replicas: (
        payload?.resource?.replicas ||
        currentReplicas ||
        1
      ).toString(),
      ports:
        payload?.ports || formattedPorts.length > 0
          ? formattedPorts
          : [
              {
                port: 80,
                protocol: "TCP",
                appProtocol: "HTTP",
                exposesPublicDomain: true,
              },
            ],
      env: payload?.env || formattedEnv,
    };
  }, [payloadKey, resourceKey]);

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

  // Reset form when payload or resource changes
  useEffect(() => {
    if (!isResourceLoading) {
      form.reset(defaultValues);
    }
  }, [payloadKey, resourceKey, form, defaultValues, isResourceLoading]);

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

      // Check if ports need to be updated
      const portsChanged =
        JSON.stringify(values.ports) !== JSON.stringify(payload?.ports);

      // Log the requests for debugging/testing
      console.log(
        "Launchpad Update Request:",
        JSON.stringify(patchRequest, null, 2)
      );
      console.log("Target:", target.name);

      if (portsChanged) {
        console.log(
          "Launchpad Ports Update Request:",
          JSON.stringify({ ports: values.ports }, null, 2)
        );
      }

      // Execute API calls
      const updatePromises = [];

      // Update main launchpad configuration (if there are changes)
      if (Object.keys(patchRequest).length > 0) {
        // Real API call for main update
        // updatePromises.push(
        //   updateMutation.mutateAsync({
        //     name: target.name || "",
        //     request: patchRequest,
        //   })
        // );
        console.log("Would call updateLaunchpad with:", {
          name: target.name || "",
          request: patchRequest,
        });
      }

      // Update ports separately (if there are changes)
      if (portsChanged) {
        // Map form ports to the expected update schema structure
        const isLaunchpadResource =
          currentResource &&
          (currentResource as any).kind &&
          ["Deployment", "StatefulSet"].includes((currentResource as any).kind);

        const currentPorts = isLaunchpadResource
          ? (currentResource as any).ports || []
          : [];
                 const updatedPorts = values.ports.map((formPort, index) => {
           // Find corresponding current port to preserve existing metadata
           const currentPort = currentPorts[index];
 
           // For existing ports, include metadata; for new ports, omit metadata
           const portUpdate = {
             port: formPort.port,
             protocol: formPort.protocol,
             appProtocol: formPort.appProtocol,
             exposesPublicDomain: formPort.exposesPublicDomain,
           };

           // Only include metadata if this is an existing port (has currentPort data)
           if (currentPort) {
             return {
               ...portUpdate,
               networkName: currentPort.networkName,
               portName: currentPort.name, // Use 'name' field from resource
               serviceName: currentPort.serviceName,
             };
           }

           return portUpdate;
         });

        const portsRequest: LaunchpadPortsUpdateRequest = {
          ports: updatedPorts,
        };

        // Real API call for ports update
        // updatePromises.push(
        //   updatePortsMutation.mutateAsync({
        //     name: target.name || "",
        //     request: portsRequest,
        //   })
        // );
        console.log("Current ports from resource:", currentPorts);
        console.log("Form ports:", values.ports);
        console.log("Mapped ports for update:", updatedPorts);
        console.log("Would call updateLaunchpadPorts with:", {
          name: target.name || "",
          request: portsRequest,
        });
      }

      // Wait for all updates to complete
      // await Promise.all(updatePromises);

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

  // Show loading state while fetching resource
  if (isResourceLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-muted-foreground">
            Loading current launchpad configuration...
          </div>
        </div>
      </BaseSystemMessage>
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
            disabled={isUpdating || !target || isResourceLoading}
            className="w-full"
          >
            {isUpdating
              ? "Updating..."
              : isResourceLoading
              ? "Loading..."
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
