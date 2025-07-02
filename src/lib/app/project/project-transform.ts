import { RESOURCES } from "@/lib/k8s/k8s-constant";
import { convertToResourceTarget } from "@/lib/k8s/k8s-utils";
import type {
  AnyKubernetesList,
  AnyKubernetesResource,
  ResourceTarget,
} from "@/lib/k8s/schemas";
import { PROJECT_NAME_LABEL_KEY } from "./project-constant";
import type { ProjectResources } from "./schemas";

// Helper function to extract project name from resource metadata
const getProjectNameFromResource = (
  resource: AnyKubernetesResource
): string | null => {
  return resource.metadata.labels?.[PROJECT_NAME_LABEL_KEY] ?? null;
};

// Helper function to group resources by project name
export const groupResourcesByProject = (
  allResourcesData: Record<string, AnyKubernetesList>
): ProjectResources => {
  const projectGroups: ProjectResources = {};

  for (const [resourceType, resourceList] of Object.entries(allResourcesData)) {
    const config = RESOURCES[resourceType as keyof typeof RESOURCES];

    if (!(config && resourceList?.items)) {
      continue;
    }

    for (const resource of resourceList.items) {
      const projectName = getProjectNameFromResource(resource);
      if (!projectName) {
        continue; // Skip resources without project label
      }

      const resourceTarget = convertToResourceTarget(resource, config);
      if (!resourceTarget) {
        continue; // Skip invalid resources
      }

      if (!projectGroups[projectName]) {
        projectGroups[projectName] = [];
      }
      projectGroups[projectName].push(resourceTarget);
    }
  }

  return projectGroups;
};

// Helper function to filter resources for a specific project
export const filterResourcesForProject = (
  allResourcesData: Record<string, AnyKubernetesList>,
  projectName: string
): ResourceTarget[] => {
  const projectResources: ResourceTarget[] = [];

  for (const [resourceType, resourceList] of Object.entries(allResourcesData)) {
    const config = RESOURCES[resourceType as keyof typeof RESOURCES];

    if (!(config && resourceList?.items)) {
      continue;
    }

    for (const resource of resourceList.items) {
      const resourceProjectName = getProjectNameFromResource(resource);
      if (resourceProjectName !== projectName) {
        continue; // Skip resources not belonging to the target project
      }

      const resourceTarget = convertToResourceTarget(resource, config);
      if (resourceTarget) {
        projectResources.push(resourceTarget);
      }
    }
  }

  return projectResources;
};
