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
import { Database, Settings } from "lucide-react";
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

// Runtime color mapping for badges
const getRuntimeColor = (runtime: DevBox["runtime"]): string => {
  const colorMap: Record<string, string> = {
    "Node.js": "bg-green-100 text-green-800 hover:bg-green-200",
    React: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "Next.js": "bg-black text-white hover:bg-gray-800",
    Python: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    Java: "bg-red-100 text-red-800 hover:bg-red-200",
    Go: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    Rust: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    "C++": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    C: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    PHP: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "Vue.js": "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    Angular: "bg-red-100 text-red-800 hover:bg-red-200",
    Svelte: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    Django: "bg-green-100 text-green-800 hover:bg-green-200",
    Flask: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    "Spring Boot": "bg-green-100 text-green-800 hover:bg-green-200",
    "Express.js": "bg-green-100 text-green-800 hover:bg-green-200",
    ".Net": "bg-purple-100 text-purple-800 hover:bg-purple-200",
  };

  return colorMap[runtime] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

// Database type color mapping
const getDatabaseColor = (type: Database["type"]): string => {
  const colorMap: Record<string, string> = {
    postgresql: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    mongodb: "bg-green-100 text-green-800 hover:bg-green-200",
    "apecloud-mysql": "bg-orange-100 text-orange-800 hover:bg-orange-200",
    redis: "bg-red-100 text-red-800 hover:bg-red-200",
    kafka: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    weaviate: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    milvus: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    pulsar: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  };

  return colorMap[type] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

// Policy color mapping
const getPolicyColor = (policy: ObjectStorageBucket["policy"]): string => {
  const colorMap: Record<string, string> = {
    Private: "bg-red-100 text-red-800 hover:bg-red-200",
    PublicRead: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    PublicReadwrite: "bg-green-100 text-green-800 hover:bg-green-200",
  };

  return colorMap[policy] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
};

export function ProjectProposalCard({
  proposal,
  className = "",
}: ProjectProposalCardProps) {
  const { name, description, resources } = proposal;
  const { devboxes, databases, buckets } = resources;

  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>("");
  const [createdResources, setCreatedResources] = useState<
    Array<{ name: string; kind: string; type?: string }>
  >([]);
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
      const projectName = generateProjectName();
      setCreationProgress(`Creating project: ${projectName}...`);
      await createProject.mutateAsync({ name: projectName });

      // Add all resources to the project
      setCreationProgress(`Adding resources to project: ${projectName}...`);
      const resourceTargets = createdResourcesList.map((resource) =>
        convertResourceTypeToTarget(resource.kind, resource.name)
      );

      await addToProject.mutateAsync({
        resources: resourceTargets,
        name: projectName,
      });

      toast.success(
        `Project "${projectName}" created successfully with all resources!`
      );

      // Clear the created resources indicator
      setCreatedResources([]);

      // Navigate to the newly created project
      router.push(`/projects/${projectName}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project or add resources");
    } finally {
      setIsCreating(false);
      setCreationProgress("");
    }
  };

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
                          <Badge className={getRuntimeColor(devbox.runtime)}>
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
                              src={CLUSTER_TYPE_ICON_MAP[database.type as keyof typeof CLUSTER_TYPE_ICON_MAP] || "https://dbprovider.bja.sealos.run/logo.svg"}
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
                          <Badge className={getDatabaseColor(database.type)}>
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
                          <Badge className={getPolicyColor(bucket.policy)}>
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

        {/* Fixed button at bottom right */}
        <div className="absolute bottom-2 right-2 p-3">
          <Button size="sm" onClick={handleCreateProject} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </div>
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
