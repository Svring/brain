"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { generateDevboxName } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { toast } from "sonner";
import { CheckCircle, Package, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// Runtime options for devbox
export const runtimeOptions = [
  { value: "Node.js", label: "Node.js" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "Go", label: "Go" },
  { value: "Rust", label: "Rust" },
  { value: "PHP", label: "PHP" },
  { value: "Debian", label: "Debian" },
  { value: "C++", label: "C++" },
  { value: ".Net", label: ".NET" },
  { value: "C", label: "C" },
] as const;

// CPU options for devbox
export const cpuOptions = [500, 1000, 2000, 4000, 6000, 8000] as const;

// Memory options for devbox
export const memoryOptions = [512, 1024, 2048, 4096, 8192, 16000] as const;

// Port protocol options for devbox
const portProtocolOptions = ["HTTPS", "GRPCS", "WSS"] as const;

// Port interface
interface Port {
  number: number;
  protocol: "HTTPS" | "GRPCS" | "WSS";
  public: boolean;
}

// Form schema with Zod validation
export const devboxFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  runtimeName: z.enum(
    runtimeOptions.map((opt) => opt.value) as [string, ...string[]]
  ),
  cpu: z.enum(cpuOptions.map((val) => val.toString()) as [string, ...string[]]),
  memory: z.enum(
    memoryOptions.map((val) => val.toString()) as [string, ...string[]]
  ),
  ports: z
    .array(
      z.object({
        number: z
          .number()
          .min(1)
          .max(65535, "Port must be between 1 and 65535"),
        protocol: z.enum(["HTTPS", "GRPCS", "WSS"]),
        public: z.boolean(),
      })
    )
    .min(1, "At least one port is required"),
});

type DevboxFormValues = z.infer<typeof devboxFormSchema>;

interface DevboxCreateMessageProps {
  payload?: {
    name?: string;
    runtimeName?: string;
    cpu?: number;
    memory?: number;
    ports?: string;
  };
}

export default function DevboxCreateMessage({
  payload,
}: DevboxCreateMessageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdDevboxName, setCreatedDevboxName] = useState<string>("");
  const { devbox, project } = useTRPCClients();
  const createDevboxMutation = useMutation(
    devbox.createDevbox.mutationOptions()
  );

  // Get selected project from context
  const { selectedProject } = useProjectState();

  // Initialize add to project mutation
  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  // Stable key for payload to avoid resets on identical content
  const payloadKey = useMemo(() => JSON.stringify(payload ?? {}), [payload]);

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues: DevboxFormValues = useMemo(
    () => ({
      name: payload?.name || generateDevboxName(),
      runtimeName: payload?.runtimeName || "Node.js",
      cpu: (payload?.cpu || 500).toString(),
      memory: (payload?.memory || 512).toString(),
      ports: [
        {
          number: 8080,
          protocol: "HTTPS" as const,
          public: false,
        },
      ],
    }),
    [payloadKey]
  );

  console.log("payload", payload);

  // Initialize form
  const form = useForm<DevboxFormValues>({
    resolver: zodResolver(devboxFormSchema),
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
        number: 8080,
        protocol: "HTTPS" as const,
        public: false,
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
    newPorts[index] = { ...newPorts[index], [field]: value };
    form.setValue("ports", newPorts);
  };

  const onSubmit = async (values: DevboxFormValues) => {
    const devboxName = values.name.trim() || generateDevboxName();

    if (!selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    setIsCreating(true);
    try {
      // Create the devbox
      await createDevboxMutation.mutateAsync({
        name: devboxName,
        runtimeName: values.runtimeName as any,
        cpu: parseInt(values.cpu),
        memory: parseInt(values.memory),
        // ports: values.ports,
      });

      // Add the created devbox to the project
      const resourceTarget = convertResourceTypeToTarget("devbox", devboxName);
      await addToProjectMutation.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });

      // Set completion state
      setCreatedDevboxName(devboxName);
      setIsCompleted(true);
      toast.success("Devbox created and added to project successfully!");
    } catch (error) {
      console.error("Failed to create devbox:", error);
      toast.error("Failed to create devbox. Please try again.");
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
            Devbox Created Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {createdDevboxName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Runtime: {form.getValues("runtimeName")} • CPU:{" "}
                {form.getValues("cpu")}m • Memory: {form.getValues("memory")}Mi
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Your devbox is now ready to use. You can access it from the
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
        <CardTitle className="text-lg">Create Devbox</CardTitle>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter devbox name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="runtimeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runtime</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select runtime" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {runtimeOptions.map((runtime) => (
                          <SelectItem key={runtime.value} value={runtime.value}>
                            {runtime.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              </div>
            </div>

            {/* Collapsible Sections */}
            <Accordion type="multiple" className="w-full space-y-1">
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
                    {form.watch("ports").map((port, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            placeholder="Port"
                            value={port.number}
                            onChange={(e) =>
                              updatePort(
                                index,
                                "number",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="col-span-1"
                          />
                          <Select
                            value={port.protocol}
                            onValueChange={(value) =>
                              updatePort(
                                index,
                                "protocol",
                                value as "HTTPS" | "GRPCS" | "WSS"
                              )
                            }
                          >
                            <SelectTrigger className="col-span-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HTTPS">HTTPS</SelectItem>
                              <SelectItem value="GRPCS">GRPCS</SelectItem>
                              <SelectItem value="WSS">WSS</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={port.public.toString()}
                            onValueChange={(value) =>
                              updatePort(index, "public", value === "true")
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
            </Accordion>

            <div className="text-sm text-muted-foreground">
              <p>Resource configuration:</p>
              <p>
                • CPU: {form.watch("cpu")}m (
                {parseInt(form.watch("cpu")) / 1000} cores)
              </p>
              <p>
                • Memory: {form.watch("memory")}Mi (
                {parseInt(form.watch("memory")) / 1024}GB)
              </p>
              <p>
                • Ports: {form.watch("ports").length} port
                {form.watch("ports").length !== 1 ? "s" : ""} configured
              </p>
            </div>

            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? "Creating..." : "Create Devbox"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
