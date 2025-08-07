import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  usePatchResourceMetadataMutation,
  useApplyInstanceYamlMutation,
  useDeleteAllResourcesMutation,
} from "@/lib/k8s/k8s-method/k8s-mutation";
import { getProjectRelatedResources } from "@/lib/algorithm/relevance/project/project-relevance";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "@/lib/project/project-constant/project-constant-label";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { generateInstanceTemplate } from "@/lib/project/project-method/project-utils";
import { composeBrainProjectMetadata } from "./brain-utils";
import { BRAIN_PROJECT_METADATA_ANNOTATION_KEY } from "../brain-constants/brain-constant-annotation-key";
import { BrainProjectObjectMetadata } from "../brain-schemas/brain-project-object-schema";

export const useCreateBrainProjectMutation = (context: K8sApiContext) => {
  const queryClient = useQueryClient();
  const createInstanceMutation = useApplyInstanceYamlMutation(context);
  const updateMetadataMutation = useUpdateBrainProjectMetadataMutation(context);

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const instanceYaml = generateInstanceTemplate(name, context.namespace);

      const instanceResource = await createInstanceMutation.mutateAsync({
        yamlContent: instanceYaml,
      });

      const metadata = composeBrainProjectMetadata();
      await updateMetadataMutation.mutateAsync({
        name,
        newMetadata: metadata,
      });

      return instanceResource;
    },
    onSuccess: (data, { name }) => {
      toast.success(`project "${name}" created successfully`);
      queryClient.invalidateQueries({
        queryKey: ["brain-projects"],
      });
    },
    onError: (error) => {
      console.log("error", error);
      toast.error("Failed to create project");
      throw error;
    },
  });
};

export const useUpdateBrainProjectNameMutation = (context: K8sApiContext) => {
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
      queryClient.invalidateQueries({
        queryKey: ["brain-projects"],
      });
    },
    onError: (error, { name }) => {
      toast.error(`Failed to rename project "${name}"`);
      throw error;
    },
  });
};

export const useUpdateBrainProjectMetadataMutation = (
  context: K8sApiContext
) => {
  const queryClient = useQueryClient();
  const patchMutation = usePatchResourceMetadataMutation(context);

  return useMutation({
    mutationFn: async ({
      name,
      newMetadata,
    }: {
      name: string;
      newMetadata: BrainProjectObjectMetadata;
    }) => {
      const target = convertResourceTypeToTarget("instance", name);
      return await patchMutation.mutateAsync({
        target,
        metadataType: "annotations",
        key: BRAIN_PROJECT_METADATA_ANNOTATION_KEY,
        value: JSON.stringify(newMetadata),
      });
    },
    onSuccess: (_, { name, newMetadata }) => {
      toast.success(`Project "${name}" metadata updated`);
      queryClient.invalidateQueries({
        queryKey: ["brain-projects"],
      });
    },
    onError: (error, { name }) => {
      toast.error(`Failed to update project "${name}" metadata`);
      throw error;
    },
  });
};

export const useDeleteBrainProjectMutation = (context: K8sApiContext) => {
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
        queryKey: ["brain-projects"],
      });
    },
    onError: (error, { name }) => {
      toast.error(`Failed to delete project "${name}".`);
      throw error;
    },
  });
};
