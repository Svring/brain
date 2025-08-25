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
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle,
  Settings,
  Cpu,
  HardDrive,
  Network,
  Plus,
  X,
  Image as ImageIcon,
  Database,
  ChevronDown,
} from "lucide-react";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { LaunchpadPatchRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import BaseSystemMessage from "../components/base-system-message";

// CPU options for launchpad
const cpuOptions = [500, 1000, 2000, 4000, 6000, 8000] as const;

// Memory options for launchpad
const memoryOptions = [512, 1024, 2048, 4096, 8192, 16000] as const;

// Replicas options for launchpad
const replicasOptions = [1, 2, 3, 5, 10] as const;

// Port protocol options for launchpad
const portProtocolOptions = ["TCP", "UDP", "SCTP"] as const;

// App protocol options for launchpad
const appProtocolOptions = ["HTTP", "GRPC", "WS"] as const;

// Port schema for form validation
const portSchema = z.object({
  port: z
    .number()
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be less than 65536"),
  protocol: z.enum(["TCP", "UDP", "SCTP"]),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean(),
});

// Environment variable schema
const envSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().optional(),
  valueFrom: z
    .object({
      secretKeyRef: z.object({
        key: z.string(),
        name: z.string(),
      }),
    })
    .optional(),
});

// Form schema with Zod validation
const launchpadUpdateFormSchema = z.object({
  image: z.string().min(1, "Image is required"),
  cpu: z.enum(cpuOptions.map((val) => val.toString()) as [string, ...string[]]),
  memory: z.enum(
    memoryOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  replicas: z.enum(
    replicasOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  ports: z.array(portSchema),
  env: z.array(envSchema),
});

type LaunchpadUpdateFormValues = z.infer<typeof launchpadUpdateFormSchema>;

interface LaunchpadResource {
  cpu: number;
  memory: number;
  replicas: number;
}

interface LaunchpadPort {
  port: number;
  protocol: "TCP" | "UDP" | "SCTP";
  appProtocol?: "HTTP" | "GRPC" | "WS";
  exposesPublicDomain: boolean;
}

interface LaunchpadEnv {
  name: string;
  value?: string;
  valueFrom?: {
    secretKeyRef: {
      key: string;
      name: string;
    };
  };
}

interface LaunchpadUpdateMessageProps {
  target: BuiltinResourceTarget;
  payload?: {
    target?: BuiltinResourceTarget;
    resource?: LaunchpadResource;
    image?: string;
    ports?: LaunchpadPort[];
    env?: LaunchpadEnv[];
    launchpadName?: string;
    status?: string;
  };
}

export default function LaunchpadUpdateMessage({
  target,
  payload,
}: LaunchpadUpdateMessageProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { launchpad } = useTRPCClients();
  const launchpadName = payload?.launchpadName || target?.name || "Launchpad";
  const status = payload?.status || "Unknown";

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
  const {
    fields: portFields,
    append: appendPort,
    remove: removePort,
  } = useFieldArray({
    control: form.control,
    name: "ports",
  });

  const {
    fields: envFields,
    append: appendEnv,
    remove: removeEnv,
  } = useFieldArray({
    control: form.control,
    name: "env",
  });

  // Reset form when payload changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [payloadKey, form, defaultValues]);

  const handleAddPort = () => {
    appendPort({
      port: 8080,
      protocol: "TCP",
      appProtocol: "HTTP",
      exposesPublicDomain: true,
    });
  };

  const handleAddEnv = () => {
    appendEnv({
      name: `ENV_${envFields.length + 1}`,
      value: "",
    });
  };

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

      await updateMutation.mutateAsync({
        name: target.name || "",
        request: patchRequest,
      });

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
      <BaseSystemMessage target={target}>
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-medium text-green-900 dark:text-green-100">
              {launchpadName} Updated Successfully
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              CPU: {form.getValues("cpu")}m • Memory: {form.getValues("memory")}
              MB • Replicas: {form.getValues("replicas")} • Ports:{" "}
              {portFields.length} • Env: {envFields.length}
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Your launchpad configuration has been updated successfully.</p>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={target}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <Label className="text-sm font-medium">Container Image</Label>
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="nginx:latest"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Resources Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <Label className="text-sm font-medium">Resources</Label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="cpu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">CPU (m)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cpuOptions.map((cpuValue) => (
                          <SelectItem
                            key={cpuValue}
                            value={cpuValue.toString()}
                          >
                            {cpuValue}m
                          </SelectItem>
                        ))}
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
                    <FormLabel className="text-xs">Memory (MB)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {memoryOptions.map((memoryValue) => (
                          <SelectItem
                            key={memoryValue}
                            value={memoryValue.toString()}
                          >
                            {memoryValue}MB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="replicas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Replicas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {replicasOptions.map((replicaValue) => (
                          <SelectItem
                            key={replicaValue}
                            value={replicaValue.toString()}
                          >
                            {replicaValue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Collapsible Sections */}
          <Accordion type="multiple" className="w-full space-y-1">
            {/* Ports Section */}
            <AccordionItem
              value="ports"
              className="inset-ring inset-ring-border rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <Network className="h-4 w-4" />
                  <span className="font-medium">
                    Ports ({portFields.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-3">
                  {portFields.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No ports configured
                    </div>
                  ) : (
                    portFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-4 gap-2">
                          <FormField
                            control={form.control}
                            name={`ports.${index}.port`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-8"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ports.${index}.protocol`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="TCP">TCP</SelectItem>
                                    <SelectItem value="UDP">UDP</SelectItem>
                                    <SelectItem value="SCTP">SCTP</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ports.${index}.appProtocol`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    <SelectItem value="HTTP">HTTP</SelectItem>
                                    <SelectItem value="GRPC">GRPC</SelectItem>
                                    <SelectItem value="WS">WS</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`ports.${index}.exposesPublicDomain`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <Label className="text-xs">
                                    Public Domain
                                  </Label>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePort(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPort}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Port
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Environment Variables Section */}
            <AccordionItem
              value="env"
              className="inset-ring inset-ring-border rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <Database className="h-4 w-4" />
                  <span className="font-medium">
                    Environment Variables ({envFields.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="space-y-3">
                  {envFields.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No environment variables configured
                    </div>
                  ) : (
                    envFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name={`env.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="VARIABLE_NAME"
                                    className="h-8"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`env.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="variable_value"
                                    className="h-8"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEnv(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddEnv}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Environment Variable
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
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
