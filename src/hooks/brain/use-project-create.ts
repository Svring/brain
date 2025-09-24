import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { nanoid } from "@/lib/utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useThreads } from "@/components/provider/thread-provider";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { objectStorageCreateSchema } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";

// Simplified deployment data format
interface SimpleDeploymentData {
  devbox?:
    | {
        name: string;
        runtime: string;
        ports?: number[];
      }
    | {
        name: string;
        runtime: string;
        ports?: number[];
      }[];
  database?:
    | {
        name: string;
        type: string;
      }
    | {
        name: string;
        type: string;
      }[];
  app?:
    | {
        name: string;
        image: string;
        ports?: number[];
      }
    | {
        name: string;
        image: string;
        ports?: number[];
      }[];
}
import { useChatActions } from "@/contexts/chat/chat-context";

interface CreateProjectOptions {
  onSuccess?: (projectName: string) => void;
  onError?: (error: any) => void;
}

export function useProjectCreate(options?: CreateProjectOptions) {
  const [isCreating, setIsCreating] = useState(false);
  const { devbox, cluster, launchpad, objectstorage, project } =
    useTRPCClients();
  // Create mutations
  const createProjectMutation = useMutation(project.create.mutationOptions());
  const createDevboxMutation = useMutation(devbox.create.mutationOptions());
  const createClusterMutation = useMutation(cluster.create.mutationOptions());
  const createLaunchpadMutation = useMutation(
    launchpad.create.mutationOptions()
  );
  const createObjectStorageMutation = useMutation(
    objectstorage.create.mutationOptions()
  );
  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const createProjectFromSimpleData = async (
    data: SimpleDeploymentData,
    projectName?: string
  ) => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      // Prepare project name
      const sanitizedName = (projectName || "project")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");

      const uniqueProjectName = `${sanitizedName}-${nanoid()}`;

      // Create all resources in parallel first
      const resourcePromises: Promise<any>[] = [];

      // Create DevBox(es) if provided
      if (data.devbox) {
        // Handle both single devbox and array of devboxes
        const devboxes = Array.isArray(data.devbox)
          ? data.devbox
          : [data.devbox];

        devboxes.forEach((devbox) => {
          const uniqueDevboxName = `${devbox.name}-${nanoid()}`;
          const devboxData = devboxCreateFormSchema.parse({
            name: uniqueDevboxName,
            runtime: devbox.runtime,
            ports: (devbox.ports || []).map((port) => ({
              number: port,
              protocol: "HTTP" as const,
              exposesPublicDomain: true,
            })),
          });

          resourcePromises.push(
            createDevboxMutation
              .mutateAsync(devboxData)
              .then((result) => ({
                type: "devbox",
                target: convertResourceTypeToTarget("devbox", uniqueDevboxName),
                result,
                success: true,
              }))
              .catch((error) => {
                throw error;
              })
          );
        });
      }

      // Create Database(s) if provided
      if (data.database) {
        // Handle both single database and array of databases
        const databases = Array.isArray(data.database)
          ? data.database
          : [data.database];

        databases.forEach((database) => {
          const uniqueDatabaseName = `${database.name}-${nanoid()}`;
          const databaseType =
            database.type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION;
          const version =
            CLUSTER_CONSTANT_TYPE_VERSION[databaseType]?.[0] ||
            "postgresql-14.8.0";

          const clusterData = clusterCreateFormSchema.parse({
            name: uniqueDatabaseName,
            type: database.type as any,
            version: version,
            resource: {
              replicas: 1,
              cpu: 2,
              memory: 2,
              storage: 10,
            },
            terminationPolicy: "Delete" as const,
          });

          resourcePromises.push(
            createClusterMutation
              .mutateAsync(clusterData)
              .then((result) => ({
                type: "cluster",
                target: convertResourceTypeToTarget(
                  "cluster",
                  uniqueDatabaseName
                ),
                result,
                success: true,
              }))
              .catch((error) => ({
                type: "cluster",
                target: convertResourceTypeToTarget(
                  "cluster",
                  uniqueDatabaseName
                ),
                result: null,
                success: false,
                error: error,
              }))
          );
        });
      }

      // Create App(s) if provided
      if (data.app) {
        // Handle both single app and array of apps
        const apps = Array.isArray(data.app) ? data.app : [data.app];

        apps.forEach((app) => {
          const uniqueAppName = `${app.name}-${nanoid()}`;
          const launchpadData = launchpadCreateFormSchema.parse({
            name: uniqueAppName,
            image: {
              imageName: app.image,
            },
            ports: (app.ports || []).map((port) => ({
              number: port,
              protocol: "HTTP" as const,
              exposesPublicDomain: true,
            })),
            env: [], // Default empty env
            resource: {
              replicas: 1,
              cpu: 2,
              memory: 4,
            },
          });

          resourcePromises.push(
            createLaunchpadMutation
              .mutateAsync(launchpadData)
              .then((result) => ({
                type: "launchpad",
                target: convertResourceTypeToTarget(
                  "deployment",
                  uniqueAppName
                ),
                result,
                success: true,
              }))
              .catch((error) => {
                throw error;
              })
          );
        });
      }

      // Wait for all resources to be created
      const resourceResults = await Promise.allSettled(resourcePromises);

      // Collect all fulfilled resources
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

      // Only create the project if we have at least one successful resource
      if (successfulResources.length === 0) {
        toast.error(
          "No resources were created successfully. Project creation cancelled."
        );
        return;
      }

      // Create the project after resources are successfully created
      const projectResult = await createProjectMutation.mutateAsync({
        name: uniqueProjectName,
      });

      const finalProjectName = projectResult.name;

      // Add all successful resources to the project
      const targets = successfulResources.map((resource) => resource.target);
      await addToProjectMutation.mutateAsync({
        resources: targets,
        name: finalProjectName,
      });

      if (failedResources.length > 0) {
        toast.error(
          `Created project but ${failedResources.length} resource(s) failed to create`
        );
      }

      toast.success(
        `Project "${finalProjectName}" created successfully with ${successfulResources.length} resource(s)`
      );

      // Call success callback if provided
      options?.onSuccess?.(finalProjectName);

      return finalProjectName;
    } catch (error: any) {
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
      options?.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createProject = async (proposal: ProjectProposal) => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      // Create the project first
      const sanitizedName = proposal.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");

      const uniqueProjectName = `${sanitizedName}-${nanoid()}`;
      const projectResult = await createProjectMutation.mutateAsync({
        name: uniqueProjectName,
      });

      const projectName = projectResult.name;

      // Create all resources in parallel
      const resourcePromises: Promise<any>[] = [];

      // Create DevBoxes
      if (proposal.resources.devbox?.length) {
        for (const devboxProposal of proposal.resources.devbox) {
          const uniqueDevboxName = `${devboxProposal.name}-${nanoid()}`;
          const devboxData = devboxCreateFormSchema.parse({
            name: uniqueDevboxName,
            runtime: devboxProposal.runtime,
            ports: devboxProposal.ports?.map((port) => ({
              number: port.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: port.publicAccess,
            })),
          });

          resourcePromises.push(
            createDevboxMutation
              .mutateAsync(devboxData)
              .then((result) => ({
                type: "devbox",
                target: convertResourceTypeToTarget("devbox", uniqueDevboxName),
                result,
                success: true,
              }))
              .catch((error) => {
                throw error;
              })
          );
        }
      }

      // Create Databases (Clusters)
      if (proposal.resources.database?.length) {
        for (const databaseProposal of proposal.resources.database) {
          const uniqueDatabaseName = `${databaseProposal.name}-${nanoid()}`;
          const databaseType =
            databaseProposal.type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION;
          const version =
            CLUSTER_CONSTANT_TYPE_VERSION[databaseType]?.[0] ||
            "postgresql-14.8.0";

          const clusterData = clusterCreateFormSchema.parse({
            name: uniqueDatabaseName,
            type: databaseProposal.type as any,
            version: version,
            resource: {
              replicas: 1,
              cpu: 2,
              memory: 2,
              storage: 10,
            },
            terminationPolicy: "Delete" as const,
          });

          resourcePromises.push(
            createClusterMutation
              .mutateAsync(clusterData)
              .then((result) => ({
                type: "cluster",
                target: convertResourceTypeToTarget(
                  "cluster",
                  uniqueDatabaseName
                ),
                result,
                success: true,
              }))
              .catch((error) => ({
                type: "cluster",
                target: convertResourceTypeToTarget(
                  "cluster",
                  uniqueDatabaseName
                ),
                result: null,
                success: false,
                error: error,
              }))
          );
        }
      }

      // Create Object Storage Buckets
      if (proposal.resources.bucket?.length) {
        for (const bucketProposal of proposal.resources.bucket) {
          const uniqueBucketName = `${bucketProposal.name}-${nanoid()}`;
          const objectStorageData = objectStorageCreateSchema.parse({
            name: uniqueBucketName,
            policy: bucketProposal.policy,
          });

          resourcePromises.push(
            createObjectStorageMutation
              .mutateAsync({
                bucketName: objectStorageData.name,
                bucketPolicy: objectStorageData.policy as
                  | "private"
                  | "publicRead"
                  | "publicReadwrite",
              })
              .then((result) => ({
                type: "objectstorage",
                target: convertResourceTypeToTarget(
                  "objectstoragebucket",
                  uniqueBucketName
                ),
                result,
                success: true,
              }))
              .catch((error) => {
                throw error;
              })
          );
        }
      }

      // Create Apps (Launchpads)
      if (proposal.resources.app?.length) {
        for (const appProposal of proposal.resources.app) {
          const uniqueAppName = `${appProposal.name}-${nanoid()}`;
          const launchpadData = launchpadCreateFormSchema.parse({
            name: uniqueAppName,
            image: {
              imageName: appProposal.image,
            },
            ports:
              appProposal.ports?.map((port) => ({
                number: port.number,
                protocol: "HTTP" as const,
                exposesPublicDomain: port.publicAccess,
              })) || [],
            env:
              appProposal.env?.map((envVar) => ({
                name: envVar.name,
                value: envVar.value,
              })) || [],
            resource: {
              replicas: 1,
              cpu: 2,
              memory: 2,
            },
          });

          resourcePromises.push(
            createLaunchpadMutation
              .mutateAsync(launchpadData)
              .then((result) => ({
                type: "launchpad",
                target: convertResourceTypeToTarget(
                  "deployment",
                  uniqueAppName
                ),
                result,
                success: true,
              }))
              .catch((error) => {
                throw error;
              })
          );
        }
      }

      // Wait for all resources to be created
      const resourceResults = await Promise.allSettled(resourcePromises);

      // Collect all fulfilled resources
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

      if (failedResources.length > 0) {
        toast.error(
          `Created project but ${failedResources.length} resource(s) failed to create`
        );
      }

      // Add all resources to the project
      if (allFulfilledResources.length > 0) {
        const targets = allFulfilledResources.map(
          (resource) => resource.target
        );
        await addToProjectMutation.mutateAsync({
          resources: targets,
          name: projectName,
        });
      }

      toast.success(
        `Project "${projectName}" created successfully with ${successfulResources.length} resource(s)`
      );

      // Call success callback if provided
      options?.onSuccess?.(projectName);

      return projectName;
    } catch (error: any) {
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
      options?.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createProject,
    createProjectFromSimpleData,
    isCreating,
  };
}
