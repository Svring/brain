"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Settings, CheckCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateDevboxAction } from "@/lib/sealos/resources/devbox/devbox-method/devbox-action";
import { useCreateClusterAction } from "@/lib/sealos/resources/cluster/cluster-method/cluster-action";
import { useCreateObjectStorageMutation } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { generateDevboxName } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { generateClusterName } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { generateBucketName } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-utils";
import {
  createSealosContext,
  createObjectStorageContext,
  createK8sContext,
} from "@/lib/auth/auth-utils";
import { toast } from "sonner";
import type { RuntimeName } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import type { ClusterType } from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api-schemas";
import {
  useCreateProjectMutation,
  useAddToProjectMutation,
} from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { generateProjectName } from "@/lib/brain/resources/project/project-method/project-utils";
import { useRouter } from "next/navigation";
import { useChatActions } from "@/contexts/chat/chat-context";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ProjectProposal,
  ProjectResources,
  DevBox,
  Database as DatabaseType,
  ObjectStorageBucket,
  App,
  Reliances,
  projectProposalFormSchema,
  ProjectProposalFormValues,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface ProjectProposalCardProps {
  proposal: ProjectProposal;
  className?: string;
}

export function ProjectProposalCard({
  proposal,
  className = "",
}: ProjectProposalCardProps) {
  const { name, description, resources } = proposal;

  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>("");
  const [createdResources, setCreatedResources] = useState<
    Array<{ name: string; kind: string; type?: string }>
  >([]);
  const [projectName, setProjectName] = useState<string>("");
  const router = useRouter();

  const sealosContext = createSealosContext();
  const objectStorageContext = createObjectStorageContext();
  const k8sContext = createK8sContext();

  const createDevbox = useCreateDevboxAction(sealosContext);
  const createCluster = useCreateClusterAction(sealosContext);
  const createObjectStorage =
    useCreateObjectStorageMutation(objectStorageContext);
  const createProject = useCreateProjectMutation(k8sContext);
  const addToProject = useAddToProjectMutation(k8sContext);

  const { openSidebarChat } = useChatActions();

  // Stable key for proposal to avoid resets on identical content
  const proposalKey = useMemo(() => JSON.stringify(proposal), [proposal]);

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues: ProjectProposalFormValues = useMemo(
    () => ({
      projectName: proposal.name || generateProjectName(),
      description: proposal.description || "",
      resources: proposal.resources || {},
    }),
    [proposalKey]
  );

  // Initialize form
  const form = useForm<ProjectProposalFormValues>({
    resolver: zodResolver(projectProposalFormSchema),
    defaultValues,
  });

  // Reset form when proposal changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [proposalKey, form, defaultValues]);

  // Helper function to map resource type to runtime name for devboxes
  const mapResourceTypeToRuntime = (type: string): RuntimeName => {
    const typeMap: Record<string, RuntimeName> = {
      app: "Node.js", // Default for app type
      database: "Debian", // Default for database type
      oss: "Debian", // Default for oss type
    };
    return typeMap[type] || "Debian";
  };

  // Helper function to map resource type to cluster type for databases
  const mapResourceTypeToClusterType = (type: string): ClusterType => {
    const typeMap: Record<string, ClusterType> = {
      database: "postgresql", // Default for database type
      app: "postgresql", // Default for app type
      oss: "postgresql", // Default for oss type
    };
    return typeMap[type] || "postgresql";
  };

  // Helper function to map bucket policy string to ObjectStorageCreateRequest policy enum
  const mapBucketPolicyToEnum = (
    policy: string
  ): "private" | "publicRead" | "publicReadWrite" => {
    const policyMap: Record<
      string,
      "private" | "publicRead" | "publicReadWrite"
    > = {
      private: "private",
      public: "publicRead",
      publicread: "publicRead",
      publicreadwrite: "publicReadWrite",
      "public-read": "publicRead",
      "public-read-write": "publicReadWrite",
    };
    return policyMap[policy.toLowerCase()] || "private"; // Default to private if no match
  };

  const onSubmit = async (values: ProjectProposalFormValues) => {
    if (!values.resources || Object.keys(values.resources).length === 0) {
      toast.error("No resources to create");
      return;
    }

    setIsCreating(true);
    try {
      const createdResourcesList: Array<{
        name: string;
        kind: string;
        type?: string;
      }> = [];

      // Create resources based on their type
      for (const resourceType in values.resources) {
        const resourcesOfType =
          values.resources[resourceType as keyof ProjectResources];
        if (!resourcesOfType || resourcesOfType.length === 0) {
          continue;
        }

        for (const resource of resourcesOfType) {
          if (resourceType === "devbox") {
            const devboxResource = resource as DevBox;
            // Create devbox for app type
            const devboxName = generateDevboxName();
            setCreationProgress(`Creating devbox: ${devboxName}...`);
            await createDevbox.mutateAsync({
              name: devboxName,
              runtimeName: mapResourceTypeToRuntime(devboxResource.runtime),
            });
            createdResourcesList.push({ name: devboxName, kind: "devbox" });
          } else if (resourceType === "database") {
            const databaseResource = resource as DatabaseType;
            // Create cluster for database type
            const clusterName = generateClusterName();
            setCreationProgress(`Creating cluster: ${clusterName}...`);
            await createCluster.mutateAsync({
              name: clusterName,
              type: mapResourceTypeToClusterType(databaseResource.type),
            });
            createdResourcesList.push({
              name: clusterName,
              kind: "cluster",
              type: mapResourceTypeToClusterType(databaseResource.type),
            });
          } else if (resourceType === "bucket") {
            const bucketResource = resource as ObjectStorageBucket;
            // Create object storage bucket for oss type
            const bucketName = generateBucketName();
            setCreationProgress(`Creating bucket: ${bucketName}...`);
            await createObjectStorage.mutateAsync({
              bucketName,
              bucketPolicy: mapBucketPolicyToEnum(bucketResource.policy),
            });
            createdResourcesList.push({
              name: bucketName,
              kind: "objectstoragebucket",
            });
          } else if (resourceType === "app") {
            const appResource = resource as App;
            // Create app resource
            const appName = generateDevboxName(); // Use generateDevboxName for app name
            setCreationProgress(`Creating app: ${appName}...`);
            await createDevbox.mutateAsync({
              name: appName,
              runtimeName: "Node.js", // Default runtime for apps
            });
            createdResourcesList.push({
              name: appName,
              kind: "devbox",
              type: "app", // Explicitly set type for app
            });
          }
        }
      }

      // Store created resources for project creation
      setCreatedResources(createdResourcesList);

      // Create project
      const generatedProjectName =
        values.projectName.trim() || generateProjectName();
      setProjectName(generatedProjectName);
      setCreationProgress(`Creating project: ${generatedProjectName}...`);
      await createProject.mutateAsync({ name: generatedProjectName });

      // Add all resources to the project
      setCreationProgress(
        `Adding resources to project: ${generatedProjectName}...`
      );
      const resourceTargets = createdResourcesList.map((resource) =>
        convertResourceTypeToTarget(resource.kind, resource.name)
      );

      await addToProject.mutateAsync({
        resources: resourceTargets,
        name: generatedProjectName,
      });

      toast.success(
        `Project "${generatedProjectName}" created successfully with all resources!`
      );

      // Store created resources for display
      setCreatedResources(createdResourcesList);
      setIsCompleted(true);

      // Navigate to the newly created project after a short delay
      setTimeout(() => {
        openSidebarChat();
        router.push(`/projects/${generatedProjectName}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project or add resources");
    } finally {
      setIsCreating(false);
      setCreationProgress("");
    }
  };

  // Reset completion state when proposal changes
  useEffect(() => {
    setIsCompleted(false);
    setCreatedResources([]);
    setProjectName("");
  }, [proposal]);

  // Group resources by type for display
  const appResources = form.watch("resources").app || [];
  const databaseResources = form.watch("resources").database || [];
  const ossResources = form.watch("resources").bucket || [];

  return (
    <Card className={`w-full max-w-3xl mx-auto ${className}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Project Proposal
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground break-words">
              Review and configure your project before creation
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {isCompleted ? (
          // Completion State
          <div className="space-y-6 pb-16">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-600">
                  Project Created Successfully!
                </h3>
                <p className="text-muted-foreground">
                  Project "{projectName}" has been created with all resources.
                </p>
              </div>
            </div>

            {/* Created Resources Summary */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Created Resources:</h4>
              <div className="space-y-3">
                {createdResources.map((resource, index) => (
                  <Card
                    key={index}
                    className="p-3 bg-green-50 border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-green-800">
                            {resource.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {resource.kind}
                          </Badge>
                          {resource.type && (
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Navigation Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => {
                  openSidebarChat();
                  router.push(`/projects/${projectName}`);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Project
              </Button>
            </div>
          </div>
        ) : (
          // Form Content
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pb-16"
            >
              {/* Project Configuration Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Configuration</h3>

                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Resources Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Resources to be Created
                </h3>

                {/* App Resources Section */}
                {appResources.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-md font-medium">
                        Application Resources ({appResources.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {appResources.map((resource, index) => (
                        <Card key={index} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src="https://devbox.bja.sealos.run/logo.svg"
                                  alt="App Icon"
                                  width={36}
                                  height={36}
                                  className="rounded-lg h-9 w-9 flex-shrink-0"
                                  priority
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs text-muted-foreground leading-none">
                                  Application
                                </span>
                                <span className="text-lg font-bold text-foreground leading-tight truncate">
                                  {resource.name}
                                </span>
                              </div>
                              <div className="flex-shrink-0">
                                <Badge>App</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground pl-1 break-words">
                              {resource.description}
                            </p>
                            <p className="text-xs text-muted-foreground pl-1">
                              Image: {resource.image}
                            </p>
                            {resource.reliances && (
                              <div className="pl-1">
                                <div className="text-sm text-muted-foreground">
                                  <strong>Dependencies:</strong>
                                </div>
                                {resource.reliances.database &&
                                  resource.reliances.database.length > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      <strong>Database:</strong>{" "}
                                      {resource.reliances.database.join(", ")}
                                    </div>
                                  )}
                                {resource.reliances.bucket &&
                                  resource.reliances.bucket.length > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      <strong>Object Storage:</strong>{" "}
                                      {resource.reliances.bucket.join(", ")}
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Database Resources Section */}
                {databaseResources.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-md font-medium">
                        Database Resources ({databaseResources.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {databaseResources.map((resource, index) => (
                        <Card key={index} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src={
                                    CLUSTER_TYPE_ICON_MAP[
                                      resource.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                                    ] ||
                                    "https://dbprovider.bja.sealos.run/logo.svg"
                                  }
                                  alt={`${resource.type} Icon`}
                                  width={36}
                                  height={36}
                                  className="rounded-lg h-9 w-9 flex-shrink-0"
                                  priority
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs text-muted-foreground leading-none">
                                  Database
                                </span>
                                <span className="text-lg font-bold text-foreground leading-tight truncate">
                                  {resource.name}
                                </span>
                              </div>
                              <div className="flex-shrink-0">
                                <Badge>{resource.type}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground pl-1 break-words">
                              {resource.description}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Object Storage Resources Section */}
                {ossResources.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-md font-medium">
                        Object Storage Resources ({ossResources.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {ossResources.map((resource, index) => (
                        <Card key={index} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
                                  alt="Object Storage Icon"
                                  width={36}
                                  height={36}
                                  className="rounded-lg border border-muted h-9 w-9 flex-shrink-0"
                                  priority
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs text-muted-foreground leading-none">
                                  Object Storage
                                </span>
                                <span className="text-lg font-bold text-foreground leading-tight truncate">
                                  {resource.name}
                                </span>
                              </div>
                              <div className="flex-shrink-0">
                                <Badge>{resource.policy}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground pl-1 break-words">
                              {resource.description}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {appResources.length === 0 &&
                  databaseResources.length === 0 &&
                  ossResources.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <div className="text-center">
                        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No resources configured for this project</p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Fixed button at bottom right */}
              <div className="absolute bottom-2 right-2 p-3">
                <Button type="submit" size="sm" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// Export types for use in other components
export type {
  ProjectProposal,
  ProjectResources,
  DevBox,
  Database as DatabaseType,
  ObjectStorageBucket,
  App,
  Reliances,
};
