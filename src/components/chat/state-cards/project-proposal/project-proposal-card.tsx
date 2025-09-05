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
  const { devbox, cluster, launchpad, objectstorage, project } = useTRPCClients();

  // Create mutations
  const createProjectMutation = useMutation(project.createProject.mutationOptions());
  const createDevboxMutation = useMutation(devbox.createDevbox.mutationOptions());
  const createClusterMutation = useMutation(cluster.createCluster.mutationOptions());
  const createLaunchpadMutation = useMutation(launchpad.createLaunchpad.mutationOptions());
  const createObjectStorageMutation = useMutation(objectstorage.createObjectStorage.mutationOptions());
  const addToProjectMutation = useMutation(project.addToProject.mutationOptions());

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
      
      // 1. Create the project first
      const projectResult = await createProjectMutation.mutateAsync({
        name: internalProposal.name,
      });
      
      const projectName = projectResult.name;
      
      // 2. Create all resources in parallel
      const resourcePromises: Promise<any>[] = [];
      
      // Create DevBoxes
      if (internalProposal.resources.devbox?.length) {
        for (const devboxProposal of internalProposal.resources.devbox) {
          const devboxData = devboxCreateFormSchema.parse({
            name: devboxProposal.name,
            runtime: devboxProposal.runtime,
            resource: {
              cpu: 2, // Default from schema [[memory:7724426]]
              memory: 2, // Default from schema [[memory:7724426]]
            },
            ports: devboxProposal.ports?.map(port => ({
              number: port.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: port.publicAccess,
            })) || [{
              number: 80,
              protocol: "HTTP" as const,
              exposesPublicDomain: true,
            }],
          });
          
          resourcePromises.push(
            createDevboxMutation.mutateAsync(devboxData).then(result => ({
              type: "devbox",
              target: convertResourceTypeToTarget("devbox", devboxProposal.name),
              result
            }))
          );
        }
      }
      
      // Create Databases (Clusters)
      if (internalProposal.resources.database?.length) {
        for (const databaseProposal of internalProposal.resources.database) {
          const clusterData = {
            name: databaseProposal.name,
            type: databaseProposal.type as any, // Type assertion for cluster types
            version: "postgresql-14.8.0", // Default version
            resource: {
              replicas: 1,
              cpu: "2000m", // CPU in millicores
              memory: "2Gi", // Memory in Gi
              storage: "20Gi", // Storage in Gi
            },
            terminationPolicy: "Delete" as const,
          };
          
          resourcePromises.push(
            createClusterMutation.mutateAsync(clusterData).then(result => ({
              type: "cluster",
              target: convertResourceTypeToTarget("cluster", databaseProposal.name),
              result
            }))
          );
        }
      }
      
      // Create Object Storage Buckets
      if (internalProposal.resources.bucket?.length) {
        for (const bucketProposal of internalProposal.resources.bucket) {
          const objectStorageData = objectStorageCreateSchema.parse({
            name: bucketProposal.name,
            policy: bucketProposal.policy.toLowerCase(), // Convert to lowercase
          });
          
          resourcePromises.push(
            createObjectStorageMutation.mutateAsync({
              bucketName: objectStorageData.name,
              bucketPolicy: objectStorageData.policy as "private" | "publicRead" | "publicReadWrite",
            }).then(result => ({
              type: "objectstorage",
              target: convertResourceTypeToTarget("objectstorage", bucketProposal.name),
              result
            }))
          );
        }
      }
      
      // Create Apps (Launchpads)
      if (internalProposal.resources.app?.length) {
        for (const appProposal of internalProposal.resources.app) {
          const launchpadData = launchpadCreateFormSchema.parse({
            name: appProposal.name,
            image: appProposal.image,
            command: "",
            args: "",
            resource: {
              replicas: 1,
              cpu: 0.5,
              memory: 0.5,
            },
            ports: appProposal.ports?.map(port => ({
              port: port.number,
              protocol: "TCP" as const,
              appProtocol: "HTTP" as const,
              exposesPublicDomain: port.publicAccess,
            })) || [{
              port: 80,
              protocol: "TCP" as const,
              appProtocol: "HTTP" as const,
              exposesPublicDomain: true,
            }],
            env: appProposal.env?.map(envVar => ({
              type: "value" as const,
              key: envVar.name,
              value: envVar.value,
            })) || [],
            hpa: null,
            imageRegistry: null,
            storage: [],
            configMap: [],
          });
          
          resourcePromises.push(
            createLaunchpadMutation.mutateAsync(launchpadData).then(result => ({
              type: "launchpad",
              target: convertResourceTypeToTarget("deployment", appProposal.name),
              result
            }))
          );
        }
      }
      
      // Wait for all resources to be created
      const resourceResults = await Promise.allSettled(resourcePromises);
      
      // Collect successfully created resources
      const successfulResources = resourceResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
        .map(result => result.value);
        
      // Log failed resources
      const failedResources = resourceResults
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map(result => result.reason);
        
      if (failedResources.length > 0) {
        console.error("Some resources failed to create:", failedResources);
        toast.error(`Created project but ${failedResources.length} resource(s) failed to create`);
      }
      
      // 3. Add all successfully created resources to the project
      if (successfulResources.length > 0) {
        const targets = successfulResources.map(resource => resource.target);
        await addToProjectMutation.mutateAsync({
          resources: targets,
          name: projectName,
        });
      }
      
      toast.success(`Project "${projectName}" created successfully with ${successfulResources.length} resource(s)`);
      
      // Navigate to the created project
      router.push(`/projects/${projectName}`);
      
    } catch (error: any) {
      console.error("Project creation failed:", error);
      toast.error(error.message || "Failed to create project. Please try again.");
    } finally {
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
