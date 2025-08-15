import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  usePatchResourceMetadataMutation,
  useApplyInstanceYamlMutation,
  useDeleteAllResourcesMutation,
  useRemoveResourceMetadataMutation,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import { getProjectRelatedResources } from "@/lib/brain/resources/project/project-method/project-relevance";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "@/lib/brain/resources/project/project-constant/project-constant-annotation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { generateInstanceTemplate } from "@/lib/sealos/resources/instance/instance-method/instance-utils";
import {
  convertInstanceToProject,
  transformProjectResourcesToItems,
  type ProjectResourceItem,
} from "./project-utils";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { createResourceOperationTasks } from "./project-utils";

export const useCreateProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const createInstanceMutation = useApplyInstanceYamlMutation(context);

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const instanceYaml = generateInstanceTemplate(name, context.namespace);

      const instanceResource = await createInstanceMutation.mutateAsync({
        yamlContent: instanceYaml,
      });

      return convertInstanceToProject(instanceResource);
    },
    onSuccess: (data, { name }) => {
      toast.success(`Project "${name}" created successfully`);
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError: (error) => {
      toast.error("Failed to create project");
      throw error;
    },
  });
};

export const useAddToProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const patchMutation = usePatchResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      name,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      name: string;
    }) => {
      // Add labels to all resources
      await patchMutation.mutateAsync({
        target: resources,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
        value: name,
      });

      // Resources are now added to instance via labels only
    },
    onSuccess: (_, { name }) => {
      toast.success(`Resources added to project ${name}`);
      // Invalidate project query since resources are added to project
      queryClient.invalidateQueries({ queryKey: ["devboxes"] });
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      queryClient.invalidateQueries({ queryKey: ["statefulsets"] });
      queryClient.invalidateQueries({ queryKey: ["objectstoragebuckets"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

/**
 * Hook to remove project name label from multiple resources
 */
export const useRemoveFromProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const removeMutation = useRemoveResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      resources,
      name,
    }: {
      resources: (CustomResourceTarget | BuiltinResourceTarget)[];
      name?: string;
    }) => {
      // Remove project label from all targets completely
      await removeMutation.mutateAsync({
        target: resources,
        metadataType: "labels",
        key: INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
      });

      // Resources are now removed from project via labels only
    },
    onSuccess: (_, { name }) => {
      if (name) {
        toast.success(`Resources removed from project ${name}`);
      } else {
        toast.success(`Resources removed from project`);
      }
      // Invalidate project query since resources are removed from project
      queryClient.invalidateQueries({ queryKey: ["devboxes"] });
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      queryClient.invalidateQueries({ queryKey: ["statefulsets"] });
      queryClient.invalidateQueries({ queryKey: ["objectstoragebuckets"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

export const useUpdateProjectNameMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const patchMutation = usePatchResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      name,
      newDisplayName,
    }: {
      name: string;
      newDisplayName: string;
    }) => {
      const target = convertResourceTypeToTarget("instance", name);
      return await patchMutation.mutateAsync({
        target,
        metadataType: "annotations",
        key: PROJECT_DISPLAY_NAME_ANNOTATION_KEY,
        value: newDisplayName,
      });
    },
    onSuccess: (_, { name, newDisplayName }) => {
      toast.success(`Project "${name}" renamed to "${newDisplayName}"`);
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error, { name }) => {
      toast.error(`Failed to rename project "${name}"`);
      throw error;
    },
  });
};

export const useDeleteProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const deleteAllResources = useDeleteAllResourcesMutation(context);

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      // 1. Get all resources related to the project
      const projectResources = await getProjectRelatedResources(context, name, [
        "deployment",
        "statefulset",
        "instance",
        "devbox",
      ]);

      // 2. Delete all found resources
      const result = await deleteAllResources.mutateAsync({
        resources: projectResources,
      });

      return {
        name,
        ...result,
      };
    },
    onSuccess: (_, { name }) => {
      toast.success(`Project "${name}" deleted successfully`);
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError: (error, { name }) => {
      toast.error(`Failed to delete project "${name}".`);
      throw error;
    },
  });
};

export const useStartProjectResourcesMutation = (context: SealosApiContext) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resources }: { resources: ProjectResourceItem[] }) => {
      const tasks = createResourceOperationTasks(resources, "start", context);
      await Promise.allSettled(tasks);
    },
    onSuccess: () => {
      toast.success("Start actions dispatched for selected resources");
      queryClient.invalidateQueries({ queryKey: ["devboxes"] });
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      queryClient.invalidateQueries({ queryKey: ["statefulsets"] });
      queryClient.invalidateQueries({ queryKey: ["objectstoragebuckets"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (error) => {
      toast.error("Failed to start some project resources");
      throw error;
    },
  });
};

export const usePauseProjectResourcesMutation = (context: SealosApiContext) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resources }: { resources: ProjectResourceItem[] }) => {
      const tasks = createResourceOperationTasks(resources, "stop", context);
      await Promise.allSettled(tasks);
    },
    onSuccess: () => {
      toast.success("Pause actions dispatched for selected resources");
      queryClient.invalidateQueries({ queryKey: ["devboxes"] });
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      queryClient.invalidateQueries({ queryKey: ["statefulsets"] });
      queryClient.invalidateQueries({ queryKey: ["objectstoragebuckets"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Failed to pause some project resources");
      throw error;
    },
  });
};

// export const useRestartProjectResourcesMutation = () => {};
