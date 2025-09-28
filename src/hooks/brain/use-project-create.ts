import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { nanoid } from "@/lib/utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useThreads } from "@/components/provider/thread-provider";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { useDevboxCreate } from "@/hooks/sealos/devbox/use-devbox-create";
import { useClusterCreate } from "@/hooks/sealos/cluster/use-cluster-create";
import { useLaunchpadCreate } from "@/hooks/sealos/launchpad/use-launchpad-create";
import { useProjectAddResource } from "@/hooks/brain/use-project-add-resource";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";

import { useChatActions } from "@/contexts/chat/chat-context";


const getDefaultClusterVersion = (type: string): string => {
  const versions =
    CLUSTER_CONSTANT_TYPE_VERSION[
      type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION
    ];
  return versions?.[0] || "postgresql-14.8.0"; 
};

const calculateProjectRequirements = (proposal: ProjectProposal) => {
  let totalCpu = 0;
  let totalMemory = 0;
  let totalStorage = 0;
  let totalPorts = 0;
  if (proposal.resources.devbox?.length) {
    proposal.resources.devbox.forEach((devbox) => {
      totalPorts += devbox.ports?.length || 1; 
    });
  }

   
  if (proposal.resources.database?.length) {
    totalStorage += proposal.resources.database.length;
  }

  if (proposal.resources.app?.length) {
    proposal.resources.app.forEach((app) => {
      totalPorts += app.ports?.length || 1; 
    });
  }

  return {
    cpu: totalCpu,
    memory: totalMemory,
    storage: totalStorage,
    ports: totalPorts,
  };
};

interface CreateProjectOptions {
  onSuccess?: (projectName: string) => void;
  onError?: (error: any) => void;
}

export function useProjectCreate(options?: CreateProjectOptions) {
  const [isCreating, setIsCreating] = useState(false);
  const { project } = useTRPCClients();
  const { checkAndShowQuotaError } = useResourceQuotaChecker();

  
  const { createDevbox } = useDevboxCreate({ addToProject: false });
  const { createCluster } = useClusterCreate({ addToProject: false });
  const { createLaunchpad } = useLaunchpadCreate({ addToProject: false });
  const { addResourcesToProject } = useProjectAddResource();

  // Create project mutation
  const createProjectMutation = useMutation(project.create.mutationOptions());

  const createProject = async (proposal: ProjectProposal) => {
    if (isCreating) return;

    const totalRequirements = calculateProjectRequirements(proposal);
    const quotaCheckPassed = checkAndShowQuotaError(totalRequirements);

    if (!quotaCheckPassed) {
      return;
    }

    try {
      setIsCreating(true);

      // Create the project first - use the proposal name as-is
      const projectResult = await createProjectMutation.mutateAsync({
        name: proposal.name,
      });

      const projectName = projectResult.name;

      // Create all resources in parallel
      const resourcePromises: Promise<any>[] = [];
      const createdTargets: any[] = [];

      // Create DevBoxes
      if (proposal.resources.devbox?.length) {
        for (const devboxProposal of proposal.resources.devbox) {
          const devboxData = devboxCreateFormSchema.parse({
            name: devboxProposal.name,
            runtime: devboxProposal.runtime,
            ports:
              devboxProposal.ports?.map((port) => ({
                number: port.number,
                protocol: "HTTP" as const,
                exposesPublicDomain: port.publicAccess,
              })) || [],
            env:
              devboxProposal.env?.map((envVar) => ({
                name: envVar.name,
                value: envVar.value,
                valueFrom: envVar.valueFrom,
              })) || [],
          });

          resourcePromises.push(
            createDevbox(devboxData)
              .then(() => {
                const target = convertResourceTypeToTarget(
                  "devbox",
                  devboxProposal.name
                );
                createdTargets.push(target);
                return {
                  type: "devbox",
                  target,
                  success: true,
                };
              })
              .catch((error) => {
                throw error;
              })
          );
        }
      }

      // Create Databases (Clusters)
      if (proposal.resources.database?.length) {
        for (const databaseProposal of proposal.resources.database) {
          const clusterData = clusterCreateFormSchema.parse({
            name: databaseProposal.name,
            type: databaseProposal.type as any,
            version: getDefaultClusterVersion(databaseProposal.type),
          });

          resourcePromises.push(
            createCluster(clusterData)
              .then(() => {
                const target = convertResourceTypeToTarget(
                  "cluster",
                  databaseProposal.name
                );
                createdTargets.push(target);
                return {
                  type: "cluster",
                  target,
                  success: true,
                };
              })
              .catch((error) => ({
                type: "cluster",
                target: convertResourceTypeToTarget(
                  "cluster",
                  databaseProposal.name
                ),
                result: null,
                success: false,
                error: error,
              }))
          );
        }
      }

      // Create Apps (Launchpads)
      if (proposal.resources.app?.length) {
        for (const appProposal of proposal.resources.app) {
          const launchpadData = launchpadCreateFormSchema.parse({
            name: appProposal.name,
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
          });

          resourcePromises.push(
            createLaunchpad(launchpadData)
              .then(() => {
                const target = convertResourceTypeToTarget(
                  "deployment",
                  appProposal.name
                );
                createdTargets.push(target);
                return {
                  type: "launchpad",
                  target,
                  success: true,
                };
              })
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
        await addResourcesToProject(projectName, targets);
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
    isCreating,
  };
}
