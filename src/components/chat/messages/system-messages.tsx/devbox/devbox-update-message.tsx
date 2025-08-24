"use client";

/**
 * DevboxUpdateMessage Component
 *
 * A flexible component for updating devbox configurations including CPU, memory, and ports.
 *
 * Usage Examples:
 *
 * 1. Update existing devbox with target:
 * <DevboxUpdateMessage
 *   payload={{
 *     target: { type: "custom", resourceType: "devbox", group: "devbox.sealos.io", version: "v1alpha1", plural: "devboxes", name: "my-devbox" },
 *     resource: { cpu: 2000, memory: 4096 },
 *     ports: [{ number: 8080, name: "web", protocol: "TCP" }],
 *     devboxName: "my-devbox",
 *     status: "Running"
 *   }}
 * />
 *
 * 2. Create new configuration (no target):
 * <DevboxUpdateMessage
 *   payload={{
 *     resource: { cpu: 1000, memory: 2048 },
 *     ports: [{ number: 3000, name: "app", protocol: "TCP" }],
 *     devboxName: "New Devbox"
 *   }}
 * />
 *
 * 3. Update with streaming parameters:
 * <DevboxUpdateMessage
 *   payload={{
 *     target: target,
 *     resource: { cpu: 4000, memory: 8192 },
 *     ports: [],
 *     devboxName: "High-Performance Devbox",
 *     status: "Running"
 *   }}
 * />
 *
 * 4. Integration with Copilot Actions:
 *
 * export const updateDevboxAction = (context: K8sApiContext) => {
 *   useCopilotAction({
 *     name: "updateDevbox",
 *     description: "Update devbox configuration with new resources and ports",
 *     parameters: [
 *       {
 *         name: "target",
 *         type: "object",
 *         required: true,
 *         description: "Devbox target configuration",
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
 *         name: "ports",
 *         type: "array",
 *         required: false,
 *         description: "Array of port configurations",
 *       },
 *     ],
 *     handler: ({ target, cpu, memory, ports }) => {
 *       return (
 *         <DevboxUpdateMessage
 *           payload={{
 *             target,
 *             resource: { cpu: cpu || 2000, memory: memory || 4096 },
 *             ports: ports || [],
 *             devboxName: target.name,
 *             status: "Running"
 *           }}
 *         />
 *       );
 *     },
 *   });
 * };
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStrategicMergePatchResourceMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { toast } from "sonner";
import {
  CheckCircle,
  Settings,
  Cpu,
  HardDrive,
  Network,
  Plus,
  X,
} from "lucide-react";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { DevboxPort } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

// Form schema with Zod validation
const devboxUpdateFormSchema = z.object({
  cpu: z
    .number()
    .min(500, "CPU must be at least 500m")
    .max(8000, "CPU must be at most 8000m"),
  memory: z
    .number()
    .min(512, "Memory must be at least 512Mi")
    .max(16000, "Memory must be at most 16000Mi"),
  ports: z.array(
    z.object({
      number: z.number().min(1).max(65535),
      name: z.string().optional(),
      protocol: z.string().transform((val) => val as "TCP" | "UDP"),
    })
  ),
});

type DevboxUpdateFormValues = z.infer<typeof devboxUpdateFormSchema>;

interface DevboxResource {
  cpu: number;
  memory: number;
}

interface DevboxUpdateMessageProps {
  target: CustomResourceTarget;
  payload?: {
    resource?: DevboxResource;
    ports?: DevboxPort[];
    devboxName?: string;
    status?: string;
  };
}

export default function DevboxUpdateMessage({
  target,
  payload,
}: DevboxUpdateMessageProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const context = createK8sContext();
  const devboxName = payload?.devboxName || target?.name || "Devbox";
  const status = payload?.status || "Unknown";

  const updateMutation = useStrategicMergePatchResourceMutation(context);

  // Define default values, merging with payload
  const defaultValues: DevboxUpdateFormValues = {
    cpu: payload?.resource?.cpu || 2000,
    memory: payload?.resource?.memory || 4096,
    ports:
      payload?.ports?.map((port) => ({
        number: port.number,
        name: port.name,
        protocol: (port.protocol as "TCP" | "UDP") || "TCP",
      })) || [],
  };

  // Initialize form
  const form = useForm<DevboxUpdateFormValues>({
    resolver: zodResolver(devboxUpdateFormSchema),
    defaultValues,
  });

  // Reset form when payload changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [payload, form]);

  const handleAddPort = () => {
    const currentPorts = form.getValues("ports");
    const newPort = {
      number: 8080,
      name: `port-${currentPorts.length + 1}`,
      protocol: "TCP" as const,
    };
    form.setValue("ports", [...currentPorts, newPort]);
  };

  const handleRemovePort = (index: number) => {
    const currentPorts = form.getValues("ports");
    form.setValue(
      "ports",
      currentPorts.filter((_, i) => i !== index)
    );
  };

  const handleUpdatePort = (
    index: number,
    field: keyof DevboxPort,
    value: any
  ) => {
    const currentPorts = form.getValues("ports");
    const updatedPorts = [...currentPorts];
    updatedPorts[index] = { ...updatedPorts[index], [field]: value };
    form.setValue("ports", updatedPorts);
  };

  const onSubmit = async (values: DevboxUpdateFormValues) => {
    if (!target) {
      toast.error("No target specified for update");
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare the patch body for strategic merge
      const patchBody: Record<string, any> = {};

      // Update resources
      patchBody.spec = {
        ...patchBody.spec,
        resource: {
          ...patchBody.spec?.resource,
          cpu: `${values.cpu}m`,
          memory: `${values.memory}Mi`,
        },
      };

      // Update ports if any are configured
      if (values.ports.length > 0) {
        patchBody.spec = {
          ...patchBody.spec,
          network: {
            ...patchBody.spec?.network,
            extraPorts: values.ports.map((port) => port.number).join(","),
          },
        };
      }

      await updateMutation.mutateAsync({
        target,
        patchBody,
      });

      setIsCompleted(true);
      toast.success("Devbox updated successfully!");
    } catch (error) {
      console.error("Failed to update devbox:", error);
      toast.error("Failed to update devbox");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="w-full bg-node-background border border-border-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Devbox Updated Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {devboxName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                CPU: {form.getValues("cpu")}m • Memory:{" "}
                {form.getValues("memory")}Mi • Ports:{" "}
                {form.getValues("ports").length}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Your devbox configuration has been updated successfully.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-node-background border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Update Devbox: {devboxName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center gap-2">
          <Badge variant={status === "Running" ? "default" : "secondary"}>
            {status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Current configuration
          </span>
        </div>

        <Separator />

        {/* Resources Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <FormLabel className="text-base font-medium">
                  Resources
                </FormLabel>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPU (m)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select CPU" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[500, 1000, 2000, 4000, 6000, 8000].map(
                            (cpuValue) => (
                              <SelectItem
                                key={cpuValue}
                                value={cpuValue.toString()}
                              >
                                {cpuValue}m ({cpuValue / 1000} cores)
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory (Mi)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Memory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[512, 1024, 2048, 4096, 8192, 16000].map(
                            (memoryValue) => (
                              <SelectItem
                                key={memoryValue}
                                value={memoryValue.toString()}
                              >
                                {memoryValue}Mi ({memoryValue / 1024}GB)
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Resource configuration:</p>
                <p>
                  • CPU: {form.watch("cpu")}m ({form.watch("cpu") / 1000} cores)
                </p>
                <p>
                  • Memory: {form.watch("memory")}Mi (
                  {form.watch("memory") / 1024}GB)
                </p>
              </div>
            </div>

            <Separator />

            <Separator />

            {/* Ports Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  <FormLabel className="text-base font-medium">Ports</FormLabel>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPort}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Port
                </Button>
              </div>

              {form.watch("ports").length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No ports configured
                </div>
              ) : (
                <div className="space-y-3">
                  {form.watch("ports").map((port, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <FormLabel className="text-xs">Port Number</FormLabel>
                          <Input
                            type="number"
                            value={port.number}
                            onChange={(e) =>
                              handleUpdatePort(
                                index,
                                "number",
                                parseInt(e.target.value)
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <FormLabel className="text-xs">Name</FormLabel>
                          <Input
                            value={port.name || ""}
                            onChange={(e) =>
                              handleUpdatePort(index, "name", e.target.value)
                            }
                            placeholder="port-name"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <FormLabel className="text-xs">Protocol</FormLabel>
                          <Select
                            value={port.protocol || "TCP"}
                            onValueChange={(value) =>
                              handleUpdatePort(index, "protocol", value)
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TCP">TCP</SelectItem>
                              <SelectItem value="UDP">UDP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePort(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                ? "Update Devbox"
                : "No Target Specified"}
            </Button>

            {!target && (
              <div className="text-sm text-muted-foreground text-center">
                <p>Target is required to update devbox configuration.</p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
