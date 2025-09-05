"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles, Loader2 } from "lucide-react";
import { ProjectDevBoxCard } from "./project-devbox-card";
import { ProjectDatabaseCard } from "./project-database-card";
import { ProjectBucketCard } from "./project-bucket-card";
import { ProjectAppCard } from "./project-app-card";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { objectStorageCreateSchema } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { nanoid } from "@/lib/utils";
import type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface ProjectProposalCardProps {
  proposal: ProjectProposal;
}

export function ProjectProposalCard({ proposal }: ProjectProposalCardProps) {
  const [internalProposal, setInternalProposal] =
    useState<ProjectProposal>(proposal);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Get tRPC clients
  const { devbox, cluster, launchpad, objectstorage, project } =
    useTRPCClients();

  // Create mutations
  const createProjectMutation = useMutation(
    project.createProject.mutationOptions()
  );
  const createDevboxMutation = useMutation(
    devbox.createDevbox.mutationOptions()
  );
  const createClusterMutation = useMutation(
    cluster.createCluster.mutationOptions()
  );
  const createLaunchpadMutation = useMutation(
    launchpad.createLaunchpad.mutationOptions()
  );
  const createObjectStorageMutation = useMutation(
    objectstorage.createObjectStorage.mutationOptions()
  );
  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  // Generic update function for all resource types
  const updateResource = <
    T extends DevBox | Database | ObjectStorageBucket | App
  >(
    resourceType: keyof ProjectProposal["resources"],
    index: number,
    updatedResource: T
  ) => {
    const newResources = [
      ...(internalProposal.resources[resourceType] || []),
    ] as T[];
    newResources[index] = updatedResource;
    const updatedProposal = {
      ...internalProposal,
      resources: {
        ...internalProposal.resources,
        [resourceType]: newResources,
      },
    };
    setInternalProposal(updatedProposal);
  };

  // Handle project creation
  const handleCreate = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      console.log("🚀 Starting project creation process", {
        proposal: internalProposal,
        resourceCounts: {
          devbox: internalProposal.resources.devbox?.length || 0,
          database: internalProposal.resources.database?.length || 0,
          bucket: internalProposal.resources.bucket?.length || 0,
          app: internalProposal.resources.app?.length || 0,
        },
      });

      // 1. Create the project first
      // Sanitize the project name to comply with Kubernetes naming requirements
      // Remove underscores and other invalid characters, ensure it starts and ends with alphanumeric
      const sanitizedName = internalProposal.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-") // Replace invalid characters with hyphens
        .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
        .replace(/-+/g, "-"); // Replace multiple consecutive hyphens with single hyphen

      const uniqueProjectName = `${sanitizedName}-${nanoid()}`;
      console.log(
        "📁 Creating project:",
        internalProposal.name,
        "-> sanitized:",
        sanitizedName,
        "-> unique name:",
        uniqueProjectName
      );
      const projectResult = await createProjectMutation.mutateAsync({
        name: uniqueProjectName,
      });

      const projectName = projectResult.name;
      console.log("✅ Project created successfully:", projectName);

      // 2. Create all resources in parallel
      const resourcePromises: Promise<any>[] = [];

      // Create DevBoxes
      if (internalProposal.resources.devbox?.length) {
        console.log(
          "🖥️ Creating DevBoxes:",
          internalProposal.resources.devbox.length
        );
        for (const devboxProposal of internalProposal.resources.devbox) {
          const uniqueDevboxName = `${devboxProposal.name}-${nanoid()}`;
          console.log(
            "Creating DevBox:",
            devboxProposal.name,
            "-> unique name:",
            uniqueDevboxName,
            "with runtime:",
            devboxProposal.runtime
          );
          const devboxData = devboxCreateFormSchema.parse({
            name: uniqueDevboxName,
            runtime: devboxProposal.runtime,
            ports: devboxProposal.ports?.map((port) => ({
              number: port.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: port.publicAccess,
            })),
          });
          console.log("DevBox parsed data:", devboxData);

          resourcePromises.push(
            createDevboxMutation
              .mutateAsync(devboxData)
              .then((result) => {
                console.log(
                  "✅ DevBox created successfully:",
                  devboxProposal.name,
                  result
                );
                return {
                  type: "devbox",
                  target: convertResourceTypeToTarget(
                    "devbox",
                    uniqueDevboxName
                  ),
                  result,
                  success: true,
                };
              })
              .catch((error) => {
                console.error(
                  "❌ DevBox creation failed:",
                  devboxProposal.name,
                  error
                );
                throw error;
              })
          );
        }
      }

      // Create Databases (Clusters)
      if (internalProposal.resources.database?.length) {
        console.log(
          "🗄️ Creating Databases:",
          internalProposal.resources.database.length
        );
        for (const databaseProposal of internalProposal.resources.database) {
          const uniqueDatabaseName = `${databaseProposal.name}-${nanoid()}`;
          console.log(
            "Creating Database:",
            databaseProposal.name,
            "-> unique name:",
            uniqueDatabaseName,
            "with type:",
            databaseProposal.type
          );
          const clusterData = clusterCreateFormSchema.parse({
            name: uniqueDatabaseName,
            type: databaseProposal.type as any, // Type assertion for cluster types
          });
          console.log("Database parsed data:", clusterData);

          resourcePromises.push(
            createClusterMutation
              .mutateAsync(clusterData)
              .then((result) => {
                console.log(
                  "✅ Database created successfully:",
                  databaseProposal.name,
                  result
                );
                return {
                  type: "cluster",
                  target: convertResourceTypeToTarget(
                    "cluster",
                    uniqueDatabaseName
                  ),
                  result,
                  success: true,
                };
              })
              .catch((error) => {
                console.error(
                  "❌ Database creation failed:",
                  databaseProposal.name,
                  error
                );
                console.log(
                  "⚠️ Still adding cluster to project by name:",
                  uniqueDatabaseName
                );
                // Even if creation failed, we still want to add it to the project by name
                return {
                  type: "cluster",
                  target: convertResourceTypeToTarget(
                    "cluster",
                    uniqueDatabaseName
                  ),
                  result: null,
                  success: false,
                  error: error,
                };
              })
          );
        }
      }

      // Create Object Storage Buckets
      if (internalProposal.resources.bucket?.length) {
        console.log(
          "🪣 Creating Object Storage Buckets:",
          internalProposal.resources.bucket.length
        );
        for (const bucketProposal of internalProposal.resources.bucket) {
          const uniqueBucketName = `${bucketProposal.name}-${nanoid()}`;
          console.log(
            "Creating Bucket:",
            bucketProposal.name,
            "-> unique name:",
            uniqueBucketName,
            "with policy:",
            bucketProposal.policy
          );
          const objectStorageData = objectStorageCreateSchema.parse({
            name: uniqueBucketName,
            policy: bucketProposal.policy, // Convert to lowercase
          });
          console.log("Bucket parsed data:", objectStorageData);

          resourcePromises.push(
            createObjectStorageMutation
              .mutateAsync({
                bucketName: objectStorageData.name,
                bucketPolicy: objectStorageData.policy as
                  | "private"
                  | "publicRead"
                  | "publicReadWrite",
              })
              .then((result) => {
                console.log(
                  "✅ Bucket created successfully:",
                  bucketProposal.name,
                  result
                );
                return {
                  type: "objectstorage",
                  target: convertResourceTypeToTarget(
                    "objectstoragebucket",
                    uniqueBucketName
                  ),
                  result,
                  success: true,
                };
              })
              .catch((error) => {
                console.error(
                  "❌ Bucket creation failed:",
                  bucketProposal.name,
                  error
                );
                throw error;
              })
          );
        }
      }

      // Create Apps (Launchpads)
      if (internalProposal.resources.app?.length) {
        console.log(
          "🚀 Creating Apps (Launchpads):",
          internalProposal.resources.app.length
        );
        for (const appProposal of internalProposal.resources.app) {
          const uniqueAppName = `${appProposal.name}-${nanoid()}`;
          console.log(
            "Creating App:",
            appProposal.name,
            "-> unique name:",
            uniqueAppName,
            "with image:",
            appProposal.image
          );
          const launchpadData = launchpadCreateFormSchema.parse({
            name: uniqueAppName,
            image: appProposal.image,
            ports: appProposal.ports?.map((port) => ({
              port: port.number,
              protocol: "TCP" as const,
              appProtocol: "HTTP" as const,
              exposesPublicDomain: port.publicAccess,
            })),
            env: appProposal.env,
          });
          console.log("App parsed data:", launchpadData);

          resourcePromises.push(
            createLaunchpadMutation
              .mutateAsync(launchpadData)
              .then((result) => {
                console.log(
                  "✅ App created successfully:",
                  appProposal.name,
                  result
                );
                return {
                  type: "launchpad",
                  target: convertResourceTypeToTarget(
                    "deployment",
                    uniqueAppName
                  ),
                  result,
                  success: true,
                };
              })
              .catch((error) => {
                console.error(
                  "❌ App creation failed:",
                  appProposal.name,
                  error
                );
                throw error;
              })
          );
        }
      }

      // Wait for all resources to be created
      console.log(
        "⏳ Waiting for all resources to be created...",
        resourcePromises.length,
        "promises"
      );
      const resourceResults = await Promise.allSettled(resourcePromises);
      console.log("📊 Resource creation results:", resourceResults);

      // Collect all fulfilled resources (both successful and failed cluster creations)
      const allFulfilledResources = resourceResults
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      // Separate successful and failed resources
      const successfulResources = allFulfilledResources.filter(
        (resource) => resource.success !== false
      );
      const failedResources = resourceResults
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((result) => result.reason);

      // Add cluster creation failures to failed resources list
      const clusterCreationFailures = allFulfilledResources.filter(
        (resource) => resource.success === false
      );
      failedResources.push(
        ...clusterCreationFailures.map((resource) => resource.error)
      );

      console.log(
        "✅ Successfully created resources:",
        successfulResources.length,
        successfulResources
      );
      console.log(
        "❌ Failed resources:",
        failedResources.length,
        failedResources
      );
      console.log(
        "⚠️ Cluster creation failures (but still added to project):",
        clusterCreationFailures.length,
        clusterCreationFailures
      );

      if (failedResources.length > 0) {
        console.error("Some resources failed to create:", failedResources);
        toast.error(
          `Created project but ${failedResources.length} resource(s) failed to create`
        );
      }

      // 3. Add all resources to the project (including failed cluster creations)
      if (allFulfilledResources.length > 0) {
        console.log(
          "🔗 Adding resources to project:",
          projectName,
          "targets:",
          allFulfilledResources.map((r) => r.target)
        );
        const targets = allFulfilledResources.map(
          (resource) => resource.target
        );
        await addToProjectMutation.mutateAsync({
          resources: targets,
          name: projectName,
        });
        console.log("✅ Resources added to project successfully");
      } else {
        console.log("⚠️ No resources to add to project");
      }

      console.log("🎉 Project creation completed successfully!");
      toast.success(
        `Project "${projectName}" created successfully with ${successfulResources.length} resource(s)`
      );

      // Navigate to the created project
      console.log("🧭 Navigating to project:", `/projects/${projectName}`);
      router.push(`/projects/${projectName}`);
    } catch (error: any) {
      console.error("💥 Project creation failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
      });
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
    } finally {
      console.log(
        "🏁 Project creation process finished, setting isCreating to false"
      );
      setIsCreating(false);
    }
  };

  const { resources } = internalProposal;

  // Define resource sections with their metadata
  const resourceSections: {
    title: string;
    key: keyof ProjectProposal["resources"];
    resources: any[];
    Component: React.ComponentType<{
      resource: any;
      onSave: (resource: any) => void;
    }>;
  }[] = [
    {
      title: "Development Environment",
      key: "devbox",
      resources: resources.devbox || [],
      Component: ProjectDevBoxCard,
    },
    {
      title: "Database",
      key: "database",
      resources: resources.database || [],
      Component: ProjectDatabaseCard,
    },
    {
      title: "Object Storage",
      key: "bucket",
      resources: resources.bucket || [],
      Component: ProjectBucketCard,
    },
    {
      title: "App Launchpad",
      key: "app",
      resources: resources.app || [],
      Component: ProjectAppCard,
    },
  ];

  // Check if there are no resources
  const hasResources = resourceSections.some(
    (section) => section.resources.length > 0
  );

  return (
    <Card
      className={`w-full max-w-3xl mx-auto bg-background-primary rounded-xl`}
    >
      <CardContent className="space-y-6">
        {hasResources ? (
          resourceSections.map(
            ({ title, key, resources, Component }) =>
              resources.length > 0 && (
                <div key={key} className="space-y-3">
                  <h4 className="text-md font-medium flex items-center gap-2">
                    {title}
                    <Badge variant="secondary">{resources.length}</Badge>
                  </h4>
                  <div className="space-y-2">
                    {resources.map((resource, index) => (
                      <Component
                        key={`${key}-${index}`}
                        resource={resource}
                        onSave={(updatedResource: any) =>
                          updateResource(key, index, updatedResource)
                        }
                      />
                    ))}
                  </div>
                </div>
              )
          )
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No resources configured for this project</p>
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-theme-blue" />
            )}
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
  Reliances,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
