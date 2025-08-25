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
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateClusterName } from "@/lib/sealos/resources/cluster/cluster-utils";
import { toast } from "sonner";
import { CheckCircle, Database } from "lucide-react";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

// Database type options for cluster
const dbTypeOptions = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "apecloud-mysql", label: "MySQL" },
  { value: "redis", label: "Redis" },
  { value: "kafka", label: "Kafka" },
  { value: "weaviate", label: "Weaviate" },
  { value: "milvus", label: "Milvus" },
  { value: "pulsar", label: "Pulsar" },
] as const;

// CPU options for cluster
const cpuOptions = [500, 1000, 2000, 4000, 6000, 8000] as const;

// Memory options for cluster
const memoryOptions = [512, 1024, 2048, 4096, 8192, 16000] as const;

// Storage options for cluster
const storageOptions = [10, 20, 50, 100, 200, 500, 1000] as const;

// Replicas options for cluster
const replicasOptions = [1, 2, 3, 5, 7, 10] as const;

// Termination policy options for cluster
const terminationPolicyOptions = ["Delete", "WipeOut"] as const;

// Form schema with Zod validation
export const clusterFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  type: z.enum(dbTypeOptions.map(opt => opt.value) as [string, ...string[]]),
  version: z.string().min(1, "Version is required"),
  cpu: z.enum(cpuOptions.map(val => val.toString()) as [string, ...string[]]),
  memory: z.enum(memoryOptions.map(val => val.toString()) as [string, ...string[]]),
  storage: z.enum(storageOptions.map(val => val.toString()) as [string, ...string[]]),
  replicas: z.enum(replicasOptions.map(val => val.toString()) as [string, ...string[]]),
  terminationPolicy: z.enum(terminationPolicyOptions),
});

type ClusterFormValues = z.infer<typeof clusterFormSchema>;

interface ClusterCreateMessageProps {
  payload?: {
    name?: string;
    type?: string;
    version?: string;
    cpu?: number;
    memory?: number;
    storage?: number;
    replicas?: number;
    terminationPolicy?: "Delete" | "WipeOut";
  };
}

export default function ClusterCreateMessage({
  payload,
}: ClusterCreateMessageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdClusterName, setCreatedClusterName] = useState<string>("");

  const { cluster, project } = useTRPCClients();
  const createClusterMutation = useMutation(
    cluster.createCluster.mutationOptions()
  );

  // Get selected project from context
  const { selectedProject } = useProjectState();

  // Initialize add to project mutation
  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  // Fetch cluster versions using TRPC router
  const { data: clusterVersions, isLoading: clusterVersionsLoading } = useQuery(
    cluster.getClusterVersions.queryOptions()
  );

  // Stable key for payload to avoid resets on identical content
  const payloadKey = useMemo(() => JSON.stringify(payload ?? {}), [payload]);

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues: ClusterFormValues = useMemo(
    () => ({
      name: payload?.name || generateClusterName(),
      type: payload?.type || "postgresql",
      version: payload?.version || "",
      cpu: (payload?.cpu || 500).toString(),
      memory: (payload?.memory || 512).toString(),
      storage: (payload?.storage || 10).toString(),
      replicas: (payload?.replicas || 1).toString(),
      terminationPolicy: payload?.terminationPolicy || "Delete",
    }),
    [payloadKey]
  );

  // Initialize form
  const form = useForm<ClusterFormValues>({
    resolver: zodResolver(clusterFormSchema),
    defaultValues,
  });

  // Reset form when payload changes
  useEffect(() => {
    form.reset({
      ...defaultValues,
      // Ensure version is reset if type changes or is invalid
      version:
        payload?.type && payload?.type === form.getValues("type")
          ? payload?.version || ""
          : "",
    });
  }, [payloadKey, form, defaultValues]);



  // Remove the hardcoded getVersionOptions function since we're now fetching dynamically

  const onSubmit = async (values: ClusterFormValues) => {
    const clusterName = values.name.trim() || generateClusterName();

    if (!selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    setIsCreating(true);
    try {
      // Create the cluster
      await createClusterMutation.mutateAsync({
        terminationPolicy: values.terminationPolicy,
        name: clusterName,
        type: values.type as any,
        version: values.version,
        resource: {
          cpu: `${parseInt(values.cpu)}m`,
          memory: `${parseInt(values.memory)}Mi`,
          storage: `${parseInt(values.storage)}Gi`,
          replicas: parseInt(values.replicas),
        },
      });

      // Add the created cluster to the project
      const resourceTarget = convertResourceTypeToTarget("cluster", clusterName);
      await addToProjectMutation.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });

      // Set completion state
      setCreatedClusterName(clusterName);
      setIsCompleted(true);
      toast.success("Cluster created and added to project successfully!");
    } catch (error) {
      console.error("Failed to create cluster:", error);
      toast.error("Failed to create cluster. Please try again.");
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
            Database Cluster Created Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Database className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {createdClusterName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Type: {form.getValues("type")} • Version:{" "}
                {form.getValues("version")} • CPU: {form.getValues("cpu")}m •
                Memory: {form.getValues("memory")}Mi • Storage:{" "}
                {form.getValues("storage")}Gi
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Your database cluster is now ready to use. You can access it from
              the project dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background-secondary border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Create Database Cluster</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter cluster name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("version", ""); // Reset version when type changes
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select database type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dbTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch("type")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !form.watch("type")
                              ? "Select database type first"
                              : "Select version"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clusterVersionsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading versions...
                        </SelectItem>
                      ) : form.watch("type") &&
                        clusterVersions?.data?.[form.watch("type")] ? (
                        // Deduplicate versions by ID to prevent duplicates
                        Array.from(
                          new Map(
                            clusterVersions.data[form.watch("type")].map(
                              (version: any) => [version.id || version, version]
                            )
                          ).values()
                        )
                          .map((version: any, index: number) => {
                            const versionValue = version.id || version;
                            const versionLabel =
                              version.label || version.id || version;

                            // Ensure we have a valid non-empty value
                            if (!versionValue || versionValue === "") {
                              return null;
                            }

                            return (
                              <SelectItem
                                key={`${form.watch(
                                  "type"
                                )}-${versionValue}-${index}`}
                                value={versionValue}
                              >
                                {versionLabel}
                              </SelectItem>
                            );
                          })
                          .filter(Boolean)
                      ) : (
                        <SelectItem value="no-versions" disabled>
                          {!form.watch("type")
                            ? "Select database type first"
                            : "No versions available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terminationPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termination Policy</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select termination policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Delete">Delete</SelectItem>
                      <SelectItem value="WipeOut">WipeOut</SelectItem>
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
                      onValueChange={field.onChange}
                      value={field.value}
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
                      onValueChange={field.onChange}
                      value={field.value}
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

            <div className="grid grid-cols-2 gap-4">
                              <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage (Gi)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Storage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {storageOptions.map((storageValue) => (
                            <SelectItem
                              key={storageValue}
                              value={storageValue.toString()}
                            >
                              {storageValue}Gi
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

            <div className="text-sm text-muted-foreground">
              <p>Resource configuration:</p>
              <p>
                • CPU: {form.watch("cpu")}m ({parseInt(form.watch("cpu")) / 1000} cores)
              </p>
              <p>
                • Memory: {form.watch("memory")}Mi (
                {parseInt(form.watch("memory")) / 1024}GB)
              </p>
              <p>• Storage: {form.watch("storage")}Gi</p>
              <p>• Replicas: {form.watch("replicas")}</p>
              <p>• Termination Policy: {form.watch("terminationPolicy")}</p>
            </div>

            <Button
              type="submit"
              disabled={isCreating || !form.watch("version")}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Cluster"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
