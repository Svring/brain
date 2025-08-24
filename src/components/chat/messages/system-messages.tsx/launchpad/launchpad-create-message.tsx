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
import { CheckCircle, Rocket, ChevronDown } from "lucide-react";

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
const storageSizeOptions = ["1Gi", "5Gi", "10Gi", "20Gi", "50Gi", "100Gi"] as const;

// Form schema with Zod validation
export const launchpadFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  image: z.string().min(1, "Image is required"),
  command: z.string().optional(),
  args: z.string().optional(),
  cpu: z.enum(cpuOptions.map(val => val.toString()) as [string, ...string[]]),
  memory: z.enum(memoryOptions.map(val => val.toString()) as [string, ...string[]]),
  replicas: z.enum(replicasOptions.map(val => val.toString()) as [string, ...string[]]),
  ports: z.string().optional(),
  portProtocol: z.enum(portProtocolOptions),
  appProtocol: z.enum(appProtocolOptions),
  exposesPublicDomain: z.boolean(),
  envVars: z.string().optional(),
  storageName: z.string().optional(),
  storagePath: z.string().optional(),
  storageSize: z.enum(storageSizeOptions),
  configMapPath: z.string().optional(),
  configMapValue: z.string().optional(),
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

  const { launchpad } = useTRPCClients();
  const createLaunchpadMutation = useMutation(
    launchpad.createLaunchpad.mutationOptions()
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
      ports: payload?.ports || "80",
      portProtocol: payload?.portProtocol || "TCP",
      appProtocol: payload?.appProtocol || "HTTP",
      exposesPublicDomain: payload?.exposesPublicDomain ?? true,
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

      // Parse ports
      const portArray = (values.ports || "")
        .split(",")
        .map((port: string) => parseInt(port.trim()))
        .filter((port: number) => !isNaN(port))
        .map((port: number) => ({
          port,
          protocol: values.portProtocol,
          appProtocol: values.appProtocol,
          exposesPublicDomain: values.exposesPublicDomain,
        }));

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

      await createLaunchpadMutation.mutateAsync({
        request: {
          name: deploymentName,
          image: values.image.trim(),
          command: (values.command || "").trim(),
          args: (values.args || "").trim(),
          resource: {
            replicas: parseInt(values.replicas),
            cpu: parseInt(values.cpu),
            memory: parseInt(values.memory),
          },
          ports: portArray,
          env: envArray,
          hpa: null,
          imageRegistry: null,
          storage: storageArray,
          configMap: configMapArray,
        },
      });

      // Set completion state
      setCreatedDeploymentName(deploymentName);
      setIsCompleted(true);
      toast.success("Deployment created successfully!");
    } catch (error) {
      console.error("Failed to create deployment:", error);
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
            Deployment Created Successfully
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
              Your deployment is now ready to use. You can access it from the
              project dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background-secondary border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Create Deployment</CardTitle>
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
            <Accordion type="multiple" className="w-full">
              {/* Command & Arguments */}
              <AccordionItem value="command-args" className="border rounded-lg">
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
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <span className="font-medium">Ports & Protocol</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="ports"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ports (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 80, 3000, 8080"
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
                      name="portProtocol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protocol</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
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
                      name="appProtocol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Protocol</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                      name="exposesPublicDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public Domain</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value === "true")
                            }
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Environment Variables, ConfigMap & Storage */}
              <AccordionItem value="env-storage" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4" />
                    <span className="font-medium">
                      Environment Variables, ConfigMap & Storage
                    </span>
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

                  <div className="space-y-2">
                    <FormLabel>ConfigMap (optional)</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="configMapPath"
                        render={({ field }) => (
                          <FormItem>
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
                            <FormControl>
                              <Input placeholder="Config value" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Storage (optional)</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="storageName"
                        render={({ field }) => (
                          <FormItem>
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
                                    <SelectItem
                                      key={sizeValue}
                                      value={sizeValue}
                                    >
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              type="submit"
              disabled={isCreating || !form.watch("image")?.trim()}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Deployment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
