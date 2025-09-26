"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import type {
  DevBox,
  Database,
  App,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface ResourceCreatorProps {
  resourcesToCreate: {
    devboxes: DevBox[];
    databases: Database[];
    apps: App[];
  };
  onSuccess?: () => void;
  onBack: () => void;
}

export function useResourceCreator({
  resourcesToCreate,
  onSuccess,
  onBack,
}: ResourceCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);

  // Hooks for resource creation
  const { devbox, cluster, launchpad, project } = useTRPCClients();
  const { selectedProject } = useProjectState();
  const { invalidateQueries } = useInvalidateQueries();

  // Create mutations
  const createDevboxMutation = useMutation(devbox.create.mutationOptions());
  const createClusterMutation = useMutation(cluster.create.mutationOptions());
  const createLaunchpadMutation = useMutation(
    launchpad.create.mutationOptions()
  );
  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const handleAdd = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      if (!selectedProject) {
        toast.error("No project selected. Please select a project first.");
        return;
      }

      // Create all resources first
      const resourcePromises: Promise<any>[] = [];
      const resourceTargets: any[] = [];

      // Create DevBoxes
      for (const devbox of resourcesToCreate.devboxes) {
        const devboxData = devboxCreateFormSchema.parse({
          name: devbox.name,
          runtime: devbox.runtime,
          ports:
            devbox.ports?.map((p: any) => ({
              number: p.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: true,
            })) || [],
          env: devbox.env || [],
          autostart: true,
        });

        resourcePromises.push(
          createDevboxMutation
            .mutateAsync(devboxData)
            .then((result) => {
              const target = convertResourceTypeToTarget(
                "devbox",
                devboxData.name
              );
              resourceTargets.push(target);
              return { type: "devbox", result, success: true };
            })
            .catch((error) => {
              throw error;
            })
        );
      }

      // Create Databases
      for (const database of resourcesToCreate.databases) {
        const databaseType =
          database.type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION;
        const version =
          CLUSTER_CONSTANT_TYPE_VERSION[databaseType]?.[0] ||
          "postgresql-14.8.0";

        const clusterData = clusterCreateFormSchema.parse({
          name: database.name,
          type: database.type,
          version: version,
          terminationPolicy: "Delete" as const,
        });

        resourcePromises.push(
          createClusterMutation
            .mutateAsync(clusterData)
            .then((result) => {
              const target = convertResourceTypeToTarget(
                "cluster",
                clusterData.name
              );
              resourceTargets.push(target);
              return { type: "cluster", result, success: true };
            })
            .catch((error) => {
              throw error;
            })
        );
      }

      // Create Apps
      for (const app of resourcesToCreate.apps) {
        const launchpadData = launchpadCreateFormSchema.parse({
          name: app.name,
          image: { imageName: app.image },
          ports:
            app.ports?.map((p: any) => ({
              number: p.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: true,
            })) || [],
          env: app.env || [],
        });

        resourcePromises.push(
          createLaunchpadMutation
            .mutateAsync(launchpadData)
            .then((result) => {
              const target = convertResourceTypeToTarget(
                "deployment",
                launchpadData.name
              );
              resourceTargets.push(target);
              return { type: "launchpad", result, success: true };
            })
            .catch((error) => {
              throw error;
            })
        );
      }

      // Wait for all resources to be created
      if (resourcePromises.length === 0) {
        toast.error("Please add at least one resource");
        return;
      }

      const resourceResults = await Promise.allSettled(resourcePromises);

      // Collect successful resources
      const successfulResources = resourceResults
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      const failedResources = resourceResults
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((result) => result.reason);

      if (successfulResources.length === 0) {
        toast.error("No resources were created successfully");
        return;
      }

      // Add all successful resources to the project in one batch
      await addToProjectMutation.mutateAsync({
        resources: resourceTargets,
        name: selectedProject,
      });

      // Invalidate queries to refresh the UI
      invalidateQueries([project.getResources.queryKey()], true);

      if (failedResources.length > 0) {
        toast.error(
          `Created ${successfulResources.length} resource(s) but ${failedResources.length} failed`
        );
      } else {
        toast.success(
          `Successfully added ${successfulResources.length} resource(s) to project`
        );
      }

      onSuccess?.();
      onBack();
    } catch (error: any) {
      toast.error(error.message || "Failed to create resources");
      console.error("Error creating resources:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    handleAdd,
    isCreating,
  };
}
