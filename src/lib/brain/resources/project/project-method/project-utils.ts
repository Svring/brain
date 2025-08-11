import {
  ProjectObjectMetadataSchema,
  ProjectObjectMetadata,
  ProjectObject,
} from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { flattenResourceList } from "@/lib/k8s/k8s-method/k8s-utils";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "../project-constant/project-constant-annotation";

export const composeProjectMetadata = (): ProjectObjectMetadata => {
  return ProjectObjectMetadataSchema.parse({
    compatibility: "brain",
    resources: [],
  });
};

/**
 * Convert instanceResourceList to simplified project list
 * @param instanceResourceList - The resource list containing Instance resources
 * @returns Array of simplified project objects
 */
export function convertInstanceListToProjectList(instanceResourceList: {
  items?: K8sResource[];
}): ProjectObject[] {
  const instances = flattenResourceList(instanceResourceList);

  return instances
    .map(convertInstanceToProject)
    .filter((project): project is ProjectObject => project !== null);
}

/**
 * Convert a single instance resource to a project object
 * @param instance - The K8s resource instance
 * @returns ProjectObject or null if conversion fails
 */
export function convertInstanceToProject(
  instance: K8sResource
): ProjectObject | null {
  try {
    if (!instance.metadata?.name) {
      return null;
    }

    const name = instance.metadata.name;
    const annotations = instance.metadata.annotations || {};
    const displayName =
      annotations[PROJECT_DISPLAY_NAME_ANNOTATION_KEY] || name;
    const createdAt = instance.metadata.creationTimestamp || "";

    return {
      name,
      displayName,
      createdAt,
    };
  } catch (error) {
    console.warn("Failed to convert instance to project:", error);
    return null;
  }
}
