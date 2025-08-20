"use client";

import React from "react";
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
import { useState } from "react";
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

// TypeScript interfaces matching the Python data structure
interface DevBox {
  name: string;
  runtime:
    | "C++"
    | "Nuxt3"
    | "Hugo"
    | "Java"
    | "Chi"
    | "PHP"
    | "Rocket"
    | "Quarkus"
    | "Debian"
    | "Ubuntu"
    | "Spring Boot"
    | "Flask"
    | "Nginx"
    | "Vue.js"
    | "Python"
    | "VitePress"
    | "Node.js"
    | "Echo"
    | "Next.js"
    | "Angular"
    | "React"
    | "Svelte"
    | "Gin"
    | "Rust"
    | "UmiJS"
    | "Docusaurus"
    | "Hexo"
    | "Vert.x"
    | "Go"
    | "C"
    | "Iris"
    | "Astro"
    | "MCP"
    | "Django"
    | "Express.js"
    | ".Net";
  description: string;
}

interface Database {
  name: string;
  type:
    | "postgresql"
    | "mongodb"
    | "apecloud-mysql"
    | "redis"
    | "kafka"
    | "weaviate"
    | "milvus"
    | "pulsar";
  description: string;
}

interface ObjectStorageBucket {
  name: string;
  policy: "Private" | "PublicRead" | "PublicReadwrite";
  description: string;
}

interface ProjectResources {
  devboxes: DevBox[];
  databases: Database[];
  buckets: ObjectStorageBucket[];
}

interface ProjectProposal {
  name: string;
  description: string;
  resources: ProjectResources;
}

interface ProjectProposalCardProps {
  proposal: ProjectProposal;
  className?: string;
}



export function ProjectProposalCard({
  proposal,
  className = "",
}: ProjectProposalCardProps) {
  const { name, description, resources } = proposal;
  const { devboxes, databases, buckets } = resources;

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

  // Helper function to map langgraph runtime names to supported API runtime names
  const mapRuntimeToEnum = (runtime: string): RuntimeName => {
    const runtimeMap: Record<string, RuntimeName> = {
      // Direct matches
      Debian: "Debian",
      "C++": "C++",
      Rust: "Rust",
      Java: "Java",
      Go: "Go",
      Python: "Python",
      "Node.js": "Node.js",
      ".Net": ".Net",
      C: "C",
      PHP: "PHP",
      // Mappings for similar runtimes
      "Spring Boot": "Java",
      Flask: "Python",
      Django: "Python",
      "Express.js": "Node.js",
      "Next.js": "Node.js",
      Nuxt3: "Node.js",
      "Vue.js": "Node.js",
      React: "Node.js",
      Angular: "Node.js",
      Svelte: "Node.js",
      VitePress: "Node.js",
      Docusaurus: "Node.js",
      Hexo: "Node.js",
      Astro: "Node.js",
      UmiJS: "Node.js",
      Echo: "Go",
      Gin: "Go",
      Iris: "Go",
      Chi: "Go",
      Rocket: "Rust",
      Quarkus: "Java",
      "Vert.x": "Java",
      Hugo: "Go",
      Nginx: "Debian",
      MCP: "Python",
      Ubuntu: "Debian",
    };
    return runtimeMap[runtime] || "Debian"; // Default to Debian if no match
  };

  // Helper function to map langgraph database types to supported API cluster types
  const mapDatabaseTypeToEnum = (dbType: string): ClusterType => {
    const dbTypeMap: Record<string, ClusterType> = {
      postgresql: "postgresql",
      mongodb: "mongodb",
      "apecloud-mysql": "apecloud-mysql",
      redis: "redis",
      kafka: "kafka",
      weaviate: "weaviate",
      milvus: "milvus",
      pulsar: "pulsar",
    };
    return dbTypeMap[dbType] || "postgresql"; // Default to postgresql if no match
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

  const handleCreateProject = async () => {
    if (!resources) return;

    setIsCreating(true);
    try {
      const createdResourcesList: Array<{
        name: string;
        kind: string;
        type?: string;
      }> = [];

      // Create devboxes
      for (const devbox of devboxes) {
        const devboxName = generateDevboxName();
        setCreationProgress(`Creating devbox: ${devboxName}...`);
        await createDevbox.mutateAsync({
          name: devboxName,
          runtimeName: mapRuntimeToEnum(devbox.runtime),
        });
        createdResourcesList.push({ name: devboxName, kind: "devbox" });
      }

      // Create clusters
      for (const database of databases) {
        const clusterName = generateClusterName();
        setCreationProgress(`Creating cluster: ${clusterName}...`);
        await createCluster.mutateAsync({
          name: clusterName,
          type: mapDatabaseTypeToEnum(database.type),
        });
        createdResourcesList.push({
          name: clusterName,
          kind: "cluster",
          type: mapDatabaseTypeToEnum(database.type),
        });
      }

      // Create object storage buckets
      for (const bucket of buckets) {
        const bucketName = generateBucketName();
        setCreationProgress(`Creating bucket: ${bucketName}...`);
        await createObjectStorage.mutateAsync({
          bucketName,
          bucketPolicy: mapBucketPolicyToEnum(bucket.policy),
        });
        createdResourcesList.push({
          name: bucketName,
          kind: "objectstoragebucket",
        });
      }

      // Store created resources for project creation
      setCreatedResources(createdResourcesList);

      // Create project
      const generatedProjectName = generateProjectName();
      setProjectName(generatedProjectName);
      setCreationProgress(`Creating project: ${generatedProjectName}...`);
      await createProject.mutateAsync({ name: generatedProjectName });

      // Add all resources to the project
      setCreationProgress(`Adding resources to project: ${generatedProjectName}...`);
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
  React.useEffect(() => {
    setIsCompleted(false);
    setCreatedResources([]);
    setProjectName("");
  }, [proposal]);

  return (
    <Card className={`w-full max-w-3xl mx-auto ${className}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground break-words">
              {description}
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
                  <Card key={index} className="p-3 bg-green-50 border-green-200">
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
          // Original Content
          <div className="space-y-4 pb-16">
          {/* DevBoxes Section */}
          {devboxes.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  Development Environments
                </h3>
              </div>
              <div className="space-y-2">
                {devboxes.map((devbox, index) => (
                  <Card key={index} className="p-3">
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
                            DevBox
                          </span>
                          <span className="text-lg font-bold text-foreground leading-tight truncate">
                            {devbox.name}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge>
                            {devbox.runtime}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-1 break-words">
                        {devbox.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Databases Section */}
          {databases.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Databases</h3>
              </div>
              <div className="space-y-2">
                {databases.map((database, index) => (
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={
                              CLUSTER_TYPE_ICON_MAP[
                                database.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                              ] || "https://dbprovider.bja.sealos.run/logo.svg"
                            }
                            alt={`${database.type} Icon`}
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
                            {database.name}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge>
                            {database.type}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-1 break-words">
                        {database.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Storage Buckets Section */}
          {buckets.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Object Storage</h3>
              </div>
              <div className="space-y-2">
                {buckets.map((bucket, index) => (
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
                            {bucket.name}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge>
                            {bucket.policy}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-1 break-words">
                        {bucket.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {devboxes.length === 0 &&
            databases.length === 0 &&
            buckets.length === 0 && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No resources configured for this project</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fixed button at bottom right */}
        <div className="absolute bottom-2 right-2 p-3">
          <Button size="sm" onClick={handleCreateProject} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </div>
      {/* )} */}
      </CardContent>
    </Card>
  );
}

// Export types for use in other components
export type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  ProjectResources,
};
