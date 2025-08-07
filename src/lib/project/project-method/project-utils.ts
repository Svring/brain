import { customAlphabet } from "nanoid";
import _ from "lodash";
import { QueryClient } from "@tanstack/react-query";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import { convertAndFilterResourceToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { getClusterRelatedResources } from "@/lib/algorithm/relevance/cluster/cluster-relevance";
import { getDeploymentRelatedResources } from "@/lib/algorithm/relevance/deployment/deployment-relevance";
import { getDevboxRelatedResources } from "@/lib/algorithm/relevance/devbox/devbox-relevance";
import { getInstanceRelatedResources } from "@/lib/algorithm/relevance/instance/instance-relevance";

export const getProjectNameFromResource = (
  resource: K8sResource
): string | null => {
  return (
    resource.metadata.labels?.[
      INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS
    ] ?? null
  );
};

export const getProjectDisplayNameFromResource = (
  resource: K8sResource
): string | null => {
  return (
    _.get(
      resource,
      "metadata.annotations['cloud.sealos.io/deploy-on-sealos-displayName']"
    ) ?? _.get(resource, "metadata.name")
  );
};

export const generateNewProjectName = () => {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  return `project-${nanoid()}`;
};

export const generateProjectTemplate = (
  projectName: string,
  namespace: string
) => {
  return `apiVersion: app.sealos.io/v1
kind: Instance
metadata:
  name: ${projectName}
  namespace: ${namespace}
  labels:
    ${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}: ${projectName}
spec:
  templateType: inline
  defaults:
    app_name:
      type: string
      value: ${projectName}
  title: ${projectName}`;
};

export const filterResourcesWithoutProject = (
  resources: K8sResource[]
): K8sResource[] => {
  return resources.filter((resource) => !getProjectNameFromResource(resource));
};

/**
 * Gather all related resources for a list of resources
 * This includes cluster-related, deploy-related, instance-related, and devbox-related resources
 */
export async function gatherRelatedResources(
  context: K8sApiContext,
  resources: (CustomResourceTarget | BuiltinResourceTarget)[]
): Promise<(CustomResourceTarget | BuiltinResourceTarget)[]> {
  let allTargets: (CustomResourceTarget | BuiltinResourceTarget)[] = [
    ...resources,
  ];
  const relatedResourcesPromises: Promise<any[]>[] = [];

  for (const resource of resources) {
    if (!resource.name) continue;

    if (
      CUSTOM_RESOURCES.cluster &&
      resource.type === "custom" &&
      resource.plural === CUSTOM_RESOURCES.cluster.plural
    ) {
      relatedResourcesPromises.push(
        getClusterRelatedResources(context, resource.name)
      );
    } else if (
      resource.type === "builtin" &&
      resource.resourceType === "deployment"
    ) {
      relatedResourcesPromises.push(
        getDeploymentRelatedResources(context, resource.name)
      );
    } else if (
      CUSTOM_RESOURCES.instance &&
      resource.type === "custom" &&
      resource.plural === CUSTOM_RESOURCES.instance.plural
    ) {
      relatedResourcesPromises.push(
        getInstanceRelatedResources(context, resource.name)
      );
    } else if (
      CUSTOM_RESOURCES.devbox &&
      resource.type === "custom" &&
      resource.plural === CUSTOM_RESOURCES.devbox.plural
    ) {
      relatedResourcesPromises.push(
        getDevboxRelatedResources(context, resource.name)
      );
    }
  }

  const relatedResourceArrays = await Promise.all(relatedResourcesPromises);
  const allRelatedResources = relatedResourceArrays.flat();
  const relatedTargets = allRelatedResources
    .map(convertAndFilterResourceToTarget)
    .filter(Boolean) as (CustomResourceTarget | BuiltinResourceTarget)[];

  allTargets.push(...relatedTargets);
  allTargets = _.uniqWith(allTargets, _.isEqual);

  return allTargets;
}



/**
 * Create project instance target for annotations
 */
export function createProjectTarget(projectName: string): CustomResourceTarget {
  return {
    type: "custom",
    resourceType: CUSTOM_RESOURCES.instance.resourceType,
    group: CUSTOM_RESOURCES.instance.group,
    version: CUSTOM_RESOURCES.instance.version,
    plural: CUSTOM_RESOURCES.instance.plural,
    name: projectName,
  };
}

/**
 * Generate query key for listing all projects
 */
export function getListProjectsQueryKey(namespace: string) {
  return ["projects", namespace];
}

/**
 * Generate query key for getting a specific project
 */
export function getProjectQueryKey(namespace: string, projectName: string) {
  return ["project", "get", namespace, projectName];
}

/**
 * Generate query key for getting project resources
 */
export function getProjectResourcesQueryKey(
  namespace: string,
  projectName: string
) {
  return ["project", "resources", namespace, projectName];
}

/**
 * Get all query keys that should be invalidated when project data changes
 */
export function getProjectQueryInvalidationKeys(
  namespace: string,
  projectName?: string
) {
  const keys = [
    // General project list queries
    getListProjectsQueryKey(namespace),
    // General inventory and k8s queries that might include project data
    ["inventory"],
    ["k8s"],
    // Broader project queries
    ["projects"],
    ["project", "resources", namespace],
    ["project", "get", namespace],
  ];

  if (projectName) {
    // Specific project queries
    keys.push(getProjectQueryKey(namespace, projectName));
    keys.push(getProjectResourcesQueryKey(namespace, projectName));
  }

  return keys;
}

/**
 * Helper function to invalidate project-related queries
 * This ensures consistent invalidation across all mutations
 */
export function invalidateProjectQueries(
  queryClient: QueryClient,
  namespace: string,
  projectName?: string
) {
  const invalidationKeys = getProjectQueryInvalidationKeys(
    namespace,
    projectName
  );
  invalidationKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}
