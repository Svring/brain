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

import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateClusterName } from "@/lib/sealos/resources/cluster/cluster-utils";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { ClusterResourceConfiguration } from "./components/cluster-resource-configuration";
import { ClusterSuccessState } from "./components/cluster-success-state";
import { Combobox } from "@/components/ui/combobox";

// Database type options for cluster
export const clusterTypeOptions = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "apecloud-mysql", label: "MySQL" },
  { value: "redis", label: "Redis" },
  { value: "kafka", label: "Kafka" },
  { value: "weaviate", label: "Weaviate" },
  { value: "milvus", label: "Milvus" },
  { value: "pulsar", label: "Pulsar" },
];

// Termination policy options for cluster
const terminationPolicyOptions = ["Delete", "WipeOut"] as const;

// Form schema with Zod validation
export const clusterFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  type: z.enum(
    clusterTypeOptions.map((opt) => opt.value) as [string, ...string[]]
  ),
  version: z.string().optional(), // Version is auto-selected, so optional
  cpu: z.string().min(1, "CPU is required"),
  memory: z.string().min(1, "Memory is required"),
  storage: z.string().min(1, "Storage is required"),
  replicas: z.string().min(1, "Replicas is required"),
  terminationPolicy: z.enum(terminationPolicyOptions).default("Delete"),
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
      cpu: (payload?.cpu || 0.5).toString(), // Default to 0.5 cores
      memory: (payload?.memory || 0.5).toString(), // Default to 0.5 GB
      storage: (payload?.storage || 1).toString(), // Use 1GB as default from STORAGE_OPTIONS
      replicas: (payload?.replicas || 1).toString(),
      terminationPolicy: "Delete", // Always default to Delete
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

  // Auto-select latest version when type changes and versions are loaded
  useEffect(() => {
    const currentType = form.watch("type");

    if (
      currentType &&
      clusterVersions?.data?.[currentType] &&
      Array.isArray(clusterVersions.data[currentType]) &&
      clusterVersions.data[currentType].length > 0
    ) {
      const firstVersion = clusterVersions.data[currentType][0];
      const versionValue =
        typeof firstVersion === "string"
          ? firstVersion
          : (firstVersion as any)?.id || firstVersion;
      form.setValue("version", versionValue);
    }
  }, [form.watch("type"), clusterVersions?.data, form]);

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
        version: values.version || "", // Handle optional version
        resource: {
          cpu: `${parseFloat(values.cpu) * 1000}m`, // Convert cores to millicores
          memory: `${parseFloat(values.memory) * 1024}Mi`, // Convert GB to MB
          storage: `${parseFloat(values.storage)}Gi`,
          replicas: parseInt(values.replicas),
        },
      });

      // Add the created cluster to the project
      const resourceTarget = convertResourceTypeToTarget(
        "cluster",
        clusterName
      );
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
      <ClusterSuccessState
        createdClusterName={createdClusterName}
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
              src={
                CLUSTER_TYPE_ICON_MAP[
                  form.watch("type") as keyof typeof CLUSTER_TYPE_ICON_MAP
                ] || "https://dbprovider.bja.sealos.run/logo.svg"
              }
              alt={`${form.watch("type")} Icon`}
              width={36}
              height={36}
              className="w-full h-full object-cover p-1"
            />
          </div>
        </div>
        <div className="flex items-center min-w-0 flex-1">
          <Input
            placeholder="Enter cluster name"
            value={form.watch("name")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue("name", e.target.value)
            }
            className="text-lg leading-tight bg-transparent h-9 border border-border"
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4 rounded-lg">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Type</FormLabel>
                  <FormControl>
                    <Combobox
                      options={clusterTypeOptions}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Clear version when type changes - useEffect will handle auto-selection
                        form.setValue("version", "");
                      }}
                      placeholder="Select database type"
                      searchPlaceholder="Search database type..."
                      emptyMessage="No database type found."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ClusterResourceConfiguration form={form} />
          </div>

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
