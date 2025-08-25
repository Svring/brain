"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { generateDeployName } from "@/lib/sealos/resources/deployment/deploy-utils";
import { toast } from "sonner";
import { CheckCircle, Rocket, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// CPU options for launchpad
const cpuOptions = [500, 1000, 2000, 4000, 6000, 8000] as const;

// Memory options for launchpad
const memoryOptions = [512, 1024, 2048, 4096, 8192, 16000] as const;

// Replicas options for launchpad
const replicasOptions = [1, 2, 3, 5, 7, 10] as const;

// Port protocol options for launchpad
const portProtocolOptions = ["TCP", "UDP", "SCTP"] as const;

// App protocol options for launchpad
const appProtocolOptions = ["HTTP", "GRPC", "WS"] as const;

// Storage size options for launchpad
const storageSizeOptions = [
  "1Gi",
  "5Gi",
  "10Gi",
  "20Gi",
  "50Gi",
  "100Gi",
] as const;

// Port interface
interface Port {
  port: number;
  protocol: "TCP" | "UDP";
  appProtocol?: "HTTP" | "GRPC" | "WS";
  exposesPublicDomain: boolean;
}

// Port schema for form validation
const portSchema = z.object({
  port: z
    .number()
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be less than 65536"),
  protocol: z.enum(["TCP", "UDP"]),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]).optional(),
  exposesPublicDomain: z.boolean(),
});

// Form schema with Zod validation
export const launchpadFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  image: z.string().min(1, "Image is required"),
  command: z.string().optional(),
  args: z.string().optional(),
  cpu: z.enum(cpuOptions.map((val) => val.toString()) as [string, ...string[]]),
  memory: z.enum(
    memoryOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  replicas: z.enum(
    replicasOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  ports: z.array(portSchema).min(1, "At least one port is required"),
  envVars: z.string().optional(),
  configMapPath: z.string().optional(),
  configMapValue: z.string().optional(),
  storageName: z.string().optional(),
  storagePath: z.string().optional(),
  storageSize: z.enum(storageSizeOptions),
});

type LaunchpadFormValues = z.infer<typeof launchpadFormSchema>;

interface DeploymentCreateMessageProps {
  payload?: {
    name?: string;
    image?: string;
    command?: string;
    args?: string;
    cpu?: number;
    memory?: number;
    replicas?: number;
    ports?: string;
    portProtocol?: "TCP" | "UDP" | "SCTP";
    appProtocol?: "HTTP" | "GRPC" | "WS";
    exposesPublicDomain?: boolean;
    envVars?: string;
    storageName?: string;
    storagePath?: string;
    storageSize?: string;
    configMapPath?: string;
    configMapValue?: string;
  };
}

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

  // Port management functions
  const addPort = () => {
    const currentPorts = form.getValues("ports");
    form.setValue("ports", [
      ...currentPorts,
      {
        port: 8080,
        protocol: "TCP",
        appProtocol: undefined,
        exposesPublicDomain: false,
      },
    ]);
  };

  const removePort = (index: number) => {
    const currentPorts = form.getValues("ports");
    if (currentPorts.length > 1) {
      form.setValue(
        "ports",
        currentPorts.filter((_, i) => i !== index)
      );
    }
  };

  const updatePort = (index: number, field: keyof Port, value: any) => {
    const currentPorts = form.getValues("ports");
    const newPorts = [...currentPorts];
    
    if (field === "protocol") {
      // If selecting TCP or UDP, clear appProtocol
      if (value === "TCP" || value === "UDP") {
        newPorts[index] = { ...newPorts[index], protocol: value, appProtocol: undefined };
      }
    } else if (field === "appProtocol") {
      // If selecting HTTP, GRPC, or WS, set protocol to TCP and set appProtocol
      if (value === "HTTP" || value === "GRPC" || value === "WS") {
        newPorts[index] = { ...newPorts[index], protocol: "TCP", appProtocol: value };
      }
    } else {
      newPorts[index] = { ...newPorts[index], [field]: value };
    }
    
    form.setValue("ports", newPorts);
  };

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

      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          toast.error(
            "An application with this name already exists. Please choose a different name."
          );
        } else if (error.message.includes("invalid")) {
          toast.error(
            "Invalid configuration. Please check your settings and try again."
          );
        } else if (error.message.includes("unauthorized")) {
          toast.error(
            "Unauthorized. Please check your permissions and try again."
          );
        } else {
          toast.error(
            `Failed to create launchpad application: ${error.message}`
          );
        }
      } else {
        toast.error(
          "Failed to create launchpad application. Please try again."
        );
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="w-full bg-background-secondary border border-border-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Launchpad Application Created Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Rocket className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {createdDeploymentName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Image: {form.getValues("image")} • CPU: {form.getValues("cpu")}m
                • Memory: {form.getValues("memory")}Mi • Replicas:{" "}
                {form.getValues("replicas")}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Your launchpad application is now ready to use. You can access it
              from the project dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter application name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Container Image</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., nginx:latest, node:18-alpine"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
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
                          {cpuOptions.map((cpuValue) => (
                            <SelectItem
                              key={cpuValue}
                              value={cpuValue.toString()}
                            >
                              {cpuValue}m ({cpuValue / 1000} cores)
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
                          {memoryOptions.map((memoryValue) => (
                            <SelectItem
                              key={memoryValue}
                              value={memoryValue.toString()}
                            >
                              {memoryValue}Mi ({memoryValue / 1024}GB)
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
                      <FormLabel>Replicas</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Replicas" />
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

            {/* Collapsible Sections */}
            <Accordion type="multiple" className="w-full space-y-1">
              {/* Command & Arguments */}
              <AccordionItem
                value="command-args"
                className="inset-ring inset-ring-border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <span className="font-medium">Command & Arguments</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="command"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Command (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., npm start" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="args"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arguments (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., --port 3000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Ports & Protocol */}
              <AccordionItem
                value="ports-protocol"
                className="inset-ring inset-ring-border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <span className="font-medium">Ports & Protocol</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="space-y-3">
                    {form.watch("ports")?.map((port, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            placeholder="Port"
                            value={port.port}
                            onChange={(e) =>
                              updatePort(
                                index,
                                "port",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="col-span-1"
                          />
                          <Select
                            value={port.appProtocol || port.protocol}
                            onValueChange={(value) =>
                              updatePort(
                                index,
                                value === "HTTP" || value === "GRPC" || value === "WS" ? "appProtocol" : "protocol",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="col-span-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TCP">TCP</SelectItem>
                              <SelectItem value="UDP">UDP</SelectItem>
                              <SelectItem value="HTTP">HTTP</SelectItem>
                              <SelectItem value="GRPC">GRPC</SelectItem>
                              <SelectItem value="WS">WS</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={port.exposesPublicDomain.toString()}
                            onValueChange={(value) =>
                              updatePort(
                                index,
                                "exposesPublicDomain",
                                value === "true"
                              )
                            }
                          >
                            <SelectTrigger className="col-span-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Public</SelectItem>
                              <SelectItem value="false">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {form.watch("ports").length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePort(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPort}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Port
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Environment Variables */}
              <AccordionItem
                value="env-vars"
                className="inset-ring inset-ring-border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <span className="font-medium">Environment Variables</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="envVars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Environment Variables (one per line, KEY=VALUE)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="NODE_ENV=production&#10;DATABASE_URL=postgresql://..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ConfigMap */}
              <AccordionItem
                value="configmap"
                className="inset-ring inset-ring-border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <span className="font-medium">ConfigMap</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="configMapPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Config Path</FormLabel>
                          <FormControl>
                            <Input placeholder="Config path" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="configMapValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Config Value</FormLabel>
                          <FormControl>
                            <Input placeholder="Config value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Storage */}
              <AccordionItem
                value="storage"
                className="inset-ring inset-ring-border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <span className="font-medium">Storage</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="storageName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Storage name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="storagePath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mount Path</FormLabel>
                          <FormControl>
                            <Input placeholder="Mount path" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="storageSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {storageSizeOptions.map((sizeValue) => (
                                  <SelectItem key={sizeValue} value={sizeValue}>
                                    {sizeValue}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
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
