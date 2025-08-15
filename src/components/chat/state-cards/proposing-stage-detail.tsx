"use client";

import { ProjectPlanWithStatus } from "@/contexts/langgraph/langgraph-schema";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useCreateDevboxAction } from "@/lib/sealos/resources/devbox/devbox-method/devbox-action";
import { useCreateClusterAction } from "@/lib/sealos/resources/cluster/cluster-method/cluster-action";
import { useCreateObjectStorageMutation } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { generateDevboxName } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { generateClusterName } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { generateBucketName } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-utils";
import { createSealosContext, createObjectStorageContext, createK8sContext } from "@/lib/auth/auth-utils";
import { useState } from "react";
import { toast } from "sonner";
import type { RuntimeName } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import type { ClusterType } from "@/lib/sealos/resources/cluster/cluster-api/cluster-open-api-schemas";
import { useCreateProjectMutation, useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { generateProjectName } from "@/lib/brain/resources/project/project-method/project-utils";
import { useRouter } from "next/navigation";

interface ProposingStageDetailProps {
  proposingData: ProjectPlanWithStatus;
  proposingStatus: "pending" | "active" | "completed";
}

export function ProposingStageDetail({
  proposingData,
  proposingStatus,
}: ProposingStageDetailProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>("");
  const [createdResources, setCreatedResources] = useState<Array<{ name: string; kind: string; type?: string }>>([]);
  const router = useRouter();
  
  const sealosContext = createSealosContext();
  const objectStorageContext = createObjectStorageContext();
  const k8sContext = createK8sContext();

  const createDevbox = useCreateDevboxAction(sealosContext);
  const createCluster = useCreateClusterAction(sealosContext);
  const createObjectStorage = useCreateObjectStorageMutation(objectStorageContext);
  const createProject = useCreateProjectMutation(k8sContext);
  const addToProject = useAddToProjectMutation(k8sContext);

  // Helper function to map langgraph runtime names to supported API runtime names
  // Maps framework-specific runtimes to their base language runtime
  // e.g., "Spring Boot" -> "Java", "Next.js" -> "Node.js"
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
    if (!proposingData.resources) return;

    setIsCreating(true);
    try {
      const createdResourcesList: Array<{ name: string; kind: string; type?: string }> = [];

      // Create devboxes
      for (const devbox of proposingData.resources.devboxes) {
        const devboxName = generateDevboxName();
        setCreationProgress(`Creating devbox: ${devboxName}...`);
        await createDevbox.mutateAsync({
          name: devboxName,
          runtimeName: mapRuntimeToEnum(devbox.runtime),
        });
        createdResourcesList.push({ name: devboxName, kind: "devbox" });
      }

      // Create clusters
      for (const database of proposingData.resources.databases) {
        const clusterName = generateClusterName();
        setCreationProgress(`Creating cluster: ${clusterName}...`);
        await createCluster.mutateAsync({
          name: clusterName,
          type: mapDatabaseTypeToEnum(database.type),
        });
        createdResourcesList.push({ 
          name: clusterName, 
          kind: "cluster", 
          type: mapDatabaseTypeToEnum(database.type) 
        });
      }

      // Create object storage buckets
      for (const bucket of proposingData.resources.buckets) {
        const bucketName = generateBucketName();
        setCreationProgress(`Creating bucket: ${bucketName}...`);
        await createObjectStorage.mutateAsync({
          bucketName,
          bucketPolicy: mapBucketPolicyToEnum(bucket.policy),
        });
        createdResourcesList.push({ name: bucketName, kind: "objectstoragebucket" });
      }

      // Store created resources for project creation
      setCreatedResources(createdResourcesList);

      // Create project
      const projectName = generateProjectName();
      setCreationProgress(`Creating project: ${projectName}...`);
      await createProject.mutateAsync({ name: projectName });

      // Add all resources to the project
      setCreationProgress(`Adding resources to project: ${projectName}...`);
      const resourceTargets = createdResourcesList.map(resource => 
        convertResourceTypeToTarget(resource.kind, resource.name)
      );
      
      await addToProject.mutateAsync({
        resources: resourceTargets,
        name: projectName,
      });

      toast.success(`Project "${projectName}" created successfully with all resources!`);
      
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
    <div className="h-full flex flex-col">
      {proposingData ? (
        <div className="h-full flex flex-col relative">
          {/* Scrollable content */}
          <div
            className={`flex-1 overflow-y-auto pr-2 ${
              proposingStatus === "completed" ? "pb-16" : "pb-4"
            }`}
          >
            <div className="space-y-4">
              {proposingData.name && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {proposingData.name}
                  </h3>
                  {proposingData.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {proposingData.description}
                    </p>
                  )}
                </div>
              )}

              {proposingData.resources &&
                (proposingData.resources.devboxes.length > 0 ||
                  proposingData.resources.databases.length > 0 ||
                  proposingData.resources.buckets.length > 0) && (
                  <div>
                    <h4 className="font-medium mb-3">Resources</h4>
                    <div className="space-y-2">
                      {proposingData.resources.devboxes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              DevBox:
                            </span>{" "}
                            <span className="font-medium">
                              {proposingData.resources.devboxes[0].runtime}
                            </span>
                            {proposingData.resources.devboxes[0]
                              .description && (
                              <span className="text-muted-foreground">
                                {" "}
                                -{" "}
                                {
                                  proposingData.resources.devboxes[0]
                                    .description
                                }
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {proposingData.resources.databases.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Database:
                            </span>{" "}
                            <span className="font-medium">
                              {proposingData.resources.databases[0].type}
                            </span>
                            {proposingData.resources.databases[0]
                              .description && (
                              <span className="text-muted-foreground">
                                {" "}
                                -{" "}
                                {
                                  proposingData.resources.databases[0]
                                    .description
                                }
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {proposingData.resources.buckets.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Bucket:
                            </span>{" "}
                            <span className="font-medium">
                              {proposingData.resources.buckets[0].policy}
                            </span>
                            {proposingData.resources.buckets[0].description && (
                              <span className="text-muted-foreground">
                                {" "}
                                -{" "}
                                {proposingData.resources.buckets[0].description}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                                         </div>
                   </div>
                 )}

                 {/* Show created resources summary */}
                 {createdResources.length > 0 && (
                   <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                     <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                       Created Resources
                     </h4>
                     <div className="space-y-1">
                       {createdResources.map((resource, index) => (
                         <div key={index} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                           <span className="text-green-600 dark:text-green-400">•</span>
                           <span className="capitalize">{resource.kind}:</span>
                           <span className="font-mono">{resource.name}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            </div>

          {/* Fixed button at bottom right - only show when completed */}
          {proposingStatus === "completed" && (
            <div className="absolute bottom-2 right-2 p-3">
              {isCreating && creationProgress && (
                <div className="mb-2 text-xs text-muted-foreground text-center max-w-48">
                  {creationProgress}
                </div>
              )}
              <Button
                size="sm"
                onClick={handleCreateProject}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          )}
        </div>
      ) : proposingStatus === "active" ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner variant="bars" size={32} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            Generating project proposal...
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No project proposal data available
        </p>
      )}
    </div>
  );
}
