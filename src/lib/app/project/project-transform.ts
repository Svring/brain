import { RESOURCES } from "@/lib/k8s/k8s-constant";
import { convertToResourceTarget } from "@/lib/k8s/k8s-utils";
import type { AnyKubernetesList } from "@/lib/k8s/schemas";
import { getProjectNameFromResource } from "./project-utils";
import type { ProjectResources } from "./schemas";

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
