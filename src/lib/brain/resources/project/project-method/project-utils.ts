import {
  ProjectObjectMetadataSchema,
  ProjectObjectMetadata,
  ProjectObject,
} from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { flattenResourceList } from "@/lib/k8s/k8s-method/k8s-utils";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "../project-constant/project-constant-annotation";

/**
 * Generates a random string of lowercase alphabets
 * @param length - The length of the random string (default: 5)
 * @returns A random string of lowercase alphabets
 */
function generateRandomString(length: number = 5): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates an automatic name for a project
 * @param prefix - Optional prefix for the name (default: 'project')
 * @returns A generated name in the format 'project-XXXXX' where XXXXX is random lowercase alphabets
 */
export const generateProjectName = (prefix: string = "project"): string => {
  const randomString = generateRandomString(5);
  return `${prefix}-${randomString}`;
};

// Type for project resource items used in mutations
export type ProjectResourceItem = {
  name: string;
  kind: string; // devbox | cluster | deployment | statefulset
  // For clusters, dbType is required by API
  type?: string;
};

export const composeProjectMetadata = (): ProjectObjectMetadata => {
  return ProjectObjectMetadataSchema.parse({
    compatibility: "brain",
    resources: [],
  });
};

/**
 * Transform project resources to ProjectResourceItem format for mutations
 * @param resources - Array of project resources from context
 * @returns Array of ProjectResourceItem objects ready for mutation calls
 */
export function transformProjectResourcesToItems(
  resources: any[]
): ProjectResourceItem[] {
  if (!Array.isArray(resources) || resources.length === 0) {
    return [];
  }

  return resources.map((resource: any) => ({
    name: resource.name,
    kind: resource.kind?.toLowerCase(),
    type: resource.type, // For clusters
  }));
}

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
