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
import {
  Database,
  Settings,
  CheckCircle,
  ExternalLink,
  Edit2,
  X,
  Save,
} from "lucide-react";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateDevboxAction } from "@/lib/sealos/resources/devbox/devbox-method/devbox-action";
import { useCreateClusterAction } from "@/lib/sealos/resources/cluster/cluster-method/cluster-action";
import { useCreateObjectStorageMutation } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import {
  generateDevboxName,
  mapRuntimeToEnum,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import {
  generateClusterName,
  mapDatabaseTypeToEnum,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import {
  generateBucketName,
  mapBucketPolicyToEnum,
} from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-utils";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Import runtime options from devbox create message
import { runtimeOptions } from "@/components/chat/messages/system-messages.tsx/devbox/devbox-create-message";

// Import database type options from cluster create message
import { clusterTypeOptions } from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";

// Import policy options from object storage create message
import { bucketPolicyOptions } from "@/components/chat/messages/system-messages.tsx/objectstorage/objectstorage-create-message";

interface ProjectProposalCardProps {
  proposal: ProjectProposal;
  className?: string;
}

// Edit mode state interface
interface EditModeState {
  [resourceType: string]: {
    [index: number]: boolean;
  };
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
  const [editMode, setEditMode] = useState<EditModeState>({});
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
    setEditMode({});
  }, [proposalKey, form, defaultValues]);

  // Toggle edit mode for a specific resource
  const toggleEditMode = (resourceType: string, index: number) => {
    setEditMode((prev) => ({
      ...prev,
      [resourceType]: {
        ...prev[resourceType],
        [index]: !prev[resourceType]?.[index],
      },
    }));
  };

  // Check if a resource is in edit mode
  const isInEditMode = (resourceType: string, index: number) => {
    return editMode[resourceType]?.[index] || false;
  };

  // Save changes for a resource
  const saveResourceChanges = (
    resourceType: string,
    index: number,
    updatedResource: any
  ) => {
    if (resourceType === "devbox") {
      const currentResources = form.getValues("resources.devbox") || [];
      const updatedResources = [...currentResources];
      updatedResources[index] = updatedResource;
      form.setValue("resources.devbox", updatedResources);
    } else if (resourceType === "database") {
      const currentResources = form.getValues("resources.database") || [];
      const updatedResources = [...currentResources];
      updatedResources[index] = updatedResource;
      form.setValue("resources.database", updatedResources);
    } else if (resourceType === "bucket") {
      const currentResources = form.getValues("resources.bucket") || [];
      const updatedResources = [...currentResources];
      updatedResources[index] = updatedResource;
      form.setValue("resources.bucket", updatedResources);
    } else if (resourceType === "app") {
      const currentResources = form.getValues("resources.app") || [];
      const updatedResources = [...currentResources];
      updatedResources[index] = updatedResource;
      form.setValue("resources.app", updatedResources);
    }
    toggleEditMode(resourceType, index);
    toast.success("Resource updated successfully");
  };

  // Cancel edit mode
  const cancelEdit = (resourceType: string, index: number) => {
    toggleEditMode(resourceType, index);
    // Reset the form field to its original value
    if (resourceType === "devbox") {
      form.resetField(`resources.devbox.${index}`);
    } else if (resourceType === "database") {
      form.resetField(`resources.database.${index}`);
    } else if (resourceType === "bucket") {
      form.resetField(`resources.bucket.${index}`);
    } else if (resourceType === "app") {
      form.resetField(`resources.app.${index}`);
    }
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
            // Create devbox for devbox type
            const devboxName = devboxResource.name || generateDevboxName();
            setCreationProgress(`Creating devbox: ${devboxName}...`);
            await createDevbox.mutateAsync({
              name: devboxName,
              runtimeName: mapRuntimeToEnum(
                devboxResource.runtime
              ) as RuntimeName,
            });
            createdResourcesList.push({ name: devboxName, kind: "devbox" });
          } else if (resourceType === "database") {
            const databaseResource = resource as DatabaseType;
            // Create cluster for database type
            const clusterName = databaseResource.name || generateClusterName();
            setCreationProgress(`Creating cluster: ${clusterName}...`);
            await createCluster.mutateAsync({
              name: clusterName,
              type: mapDatabaseTypeToEnum(databaseResource.type) as ClusterType,
            });
            createdResourcesList.push({
              name: clusterName,
              kind: "cluster",
              type: mapDatabaseTypeToEnum(databaseResource.type),
            });
          } else if (resourceType === "bucket") {
            const bucketResource = resource as ObjectStorageBucket;
            // Create object storage bucket for bucket type
            const bucketName = bucketResource.name || generateBucketName();
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
            // Create app resource (using launchpad)
            const appName = appResource.name || generateDevboxName();
            setCreationProgress(`Creating app: ${appName}...`);
            // For now, create as devbox with Node.js runtime for apps
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
  const devboxResources = form.watch("resources").devbox || [];
  const databaseResources = form.watch("resources").database || [];
  const bucketResources = form.watch("resources").bucket || [];
  const appResources = form.watch("resources").app || [];

  // Resource editing components
  const DevBoxEditForm = ({
    resource,
    index,
  }: {
    resource: DevBox;
    index: number;
  }) => {
    const [editData, setEditData] = useState(resource);

    const handleSave = () => {
      saveResourceChanges("devbox", index, editData);
    };

    return (
      <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-blue-800">Edit DevBox</h5>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelEdit("devbox", index)}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-blue-700">Name</label>
            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-blue-700">Runtime</label>
            <Select
              value={editData.runtime}
              onValueChange={(value) =>
                setEditData({ ...editData, runtime: value as any })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {runtimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-blue-700">
            Description
          </label>
          <Textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className="mt-1"
            rows={2}
          />
        </div>
      </div>
    );
  };

  const DatabaseEditForm = ({
    resource,
    index,
  }: {
    resource: DatabaseType;
    index: number;
  }) => {
    const [editData, setEditData] = useState(resource);

    const handleSave = () => {
      saveResourceChanges("database", index, editData);
    };

    return (
      <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-green-800">Edit Database</h5>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelEdit("database", index)}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-green-700">Name</label>
            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-green-700">Type</label>
            <Select
              value={editData.type}
              onValueChange={(value) =>
                setEditData({ ...editData, type: value as any })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clusterTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-green-700">
            Description
          </label>
          <Textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className="mt-1"
            rows={2}
          />
        </div>
      </div>
    );
  };

  const BucketEditForm = ({
    resource,
    index,
  }: {
    resource: ObjectStorageBucket;
    index: number;
  }) => {
    const [editData, setEditData] = useState(resource);

    const handleSave = () => {
      saveResourceChanges("bucket", index, editData);
    };

    return (
      <div className="space-y-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-orange-800">Edit Object Storage</h5>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelEdit("bucket", index)}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-orange-700">Name</label>
            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-orange-700">
              Policy
            </label>
            <Select
              value={editData.policy}
              onValueChange={(value) =>
                setEditData({ ...editData, policy: value as any })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bucketPolicyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-orange-700">
            Description
          </label>
          <Textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className="mt-1"
            rows={2}
          />
        </div>
      </div>
    );
  };

  const AppEditForm = ({
    resource,
    index,
  }: {
    resource: App;
    index: number;
  }) => {
    const [editData, setEditData] = useState(resource);

    const handleSave = () => {
      saveResourceChanges("app", index, editData);
    };

    return (
      <div className="space-y-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-purple-800">Edit Application</h5>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelEdit("app", index)}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-purple-700">Name</label>
            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-purple-700">Image</label>
            <Input
              value={editData.image}
              onChange={(e) =>
                setEditData({ ...editData, image: e.target.value })
              }
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-purple-700">
            Description
          </label>
          <Textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className="mt-1"
            rows={2}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full max-w-3xl mx-auto ${className}`}>
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

                {/* DevBox Resources Section */}
                {devboxResources.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-md font-medium">
                        Development Environment ({devboxResources.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {devboxResources.map((resource, index) => (
                        <Card key={index} className="p-3">
                          {isInEditMode("devbox", index) ? (
                            <DevBoxEditForm resource={resource} index={index} />
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  <Image
                                    src="https://devbox.bja.sealos.run/logo.svg"
                                    alt="DevBox Icon"
                                    width={36}
                                    height={36}
                                    className="rounded-lg h-9 w-9 flex-shrink-0"
                                    priority
                                  />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-xs text-muted-foreground leading-none">
                                    Development Environment
                                  </span>
                                  <span className="text-lg font-bold text-foreground leading-tight truncate">
                                    {resource.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge>{resource.runtime}</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      toggleEditMode("devbox", index)
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground pl-1 break-words">
                                {resource.description}
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
                          )}
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
                          {isInEditMode("database", index) ? (
                            <DatabaseEditForm
                              resource={resource}
                              index={index}
                            />
                          ) : (
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
                                <div className="flex items-center gap-2">
                                  <Badge>{resource.type}</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      toggleEditMode("database", index)
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground pl-1 break-words">
                                {resource.description}
                              </p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Object Storage Resources Section */}
                {bucketResources.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-md font-medium">
                        Object Storage Resources ({bucketResources.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {bucketResources.map((resource, index) => (
                        <Card key={index} className="p-3">
                          {isInEditMode("bucket", index) ? (
                            <BucketEditForm resource={resource} index={index} />
                          ) : (
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
                                <div className="flex items-center gap-2">
                                  <Badge>{resource.policy}</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      toggleEditMode("bucket", index)
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground pl-1 break-words">
                                {resource.description}
                              </p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

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
                          {isInEditMode("app", index) ? (
                            <AppEditForm resource={resource} index={index} />
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  <Image
                                    src="https://applaunchpad.bja.sealos.run/logo.svg"
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
                                <div className="flex items-center gap-2">
                                  <Badge>App</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleEditMode("app", index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
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
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {devboxResources.length === 0 &&
                  databaseResources.length === 0 &&
                  bucketResources.length === 0 &&
                  appResources.length === 0 && (
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
