import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { nanoid } from "@/lib/utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { objectStorageCreateSchema } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { ProjectResources } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface AddResourceToProjectOptions {
  onSuccess?: (projectName: string, addedResources: any[]) => void;
  onError?: (error: any) => void;
}

export function useProjectAddResource(options?: AddResourceToProjectOptions) {
  const [isAdding, setIsAdding] = useState(false);
  const { devbox, cluster, launchpad, objectstorage, project } =
    useTRPCClients();

  // Create mutations
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

  const addResourcesToProject = async (
    projectName: string,
    resources: ProjectResources
  ) => {
    if (isAdding || !projectName) return;

    try {
      setIsAdding(true);

      // Create all resources in parallel
      const resourcePromises: Promise<any>[] = [];

      // Create DevBoxes
      if (resources.devbox?.length) {
        for (const devboxProposal of resources.devbox) {
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
      if (resources.database?.length) {
        for (const databaseProposal of resources.database) {
          const uniqueDatabaseName = `${databaseProposal.name}-${nanoid()}`;
          const clusterData = clusterCreateFormSchema.parse({
            name: uniqueDatabaseName,
            type: databaseProposal.type as any,
            version: "postgresql-14.8.0", // Default version
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
      if (resources.bucket?.length) {
        for (const bucketProposal of resources.bucket) {
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
      if (resources.app?.length) {
        for (const appProposal of resources.app) {
          const uniqueAppName = `${appProposal.name}-${nanoid()}`;
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
          `Added ${successfulResources.length} resource(s) but ${failedResources.length} resource(s) failed to create`
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
        `Added ${successfulResources.length} resource(s) to project "${projectName}"`
      );

      // Call success callback if provided
      options?.onSuccess?.(projectName, successfulResources);

      return { projectName, successfulResources, failedResources };
    } catch (error: any) {
      toast.error(
        error.message || "Failed to add resources to project. Please try again."
      );
      options?.onError?.(error);
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addResourcesToProject,
    isAdding,
  };
}
