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
import { getClusterRelatedResources } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { getDeploymentRelatedResources } from "@/lib/sealos/resources/deployment/deployment-method/deployment-query";
import { getDevboxRelatedResources } from "../../devbox/devbox-method/devbox-relevance";
import { getInstanceRelatedResources } from "./instance-query";

export const getInstanceNameFromResource = (
  resource: K8sResource
): string | null => {
  return (
    resource.metadata.labels?.[
      INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS
    ] ?? null
  );
};

export const getInstanceDisplayNameFromResource = (
  resource: K8sResource
): string | null => {
  return (
    _.get(
      resource,
      "metadata.annotations['cloud.sealos.io/deploy-on-sealos-displayName']"
    ) ?? _.get(resource, "metadata.name")
  );
};

export const generateNewInstanceName = () => {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  return `instance-${nanoid()}`;
};

export const generateInstanceTemplate = (
  instanceName: string,
  namespace: string
) => {
  return `apiVersion: app.sealos.io/v1
kind: Instance
metadata:
  name: ${instanceName}
  namespace: ${namespace}
  labels:
    ${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}: ${instanceName}
spec:
  templateType: inline
  defaults:
    app_name:
      type: string
      value: ${instanceName}
  title: ${instanceName}`;
};

export const filterResourcesWithoutInstance = (
  resources: K8sResource[]
): K8sResource[] => {
  return resources.filter((resource) => !getInstanceNameFromResource(resource));
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
 * Create instance instance target for annotations
 */
export function createInstanceTarget(
  instanceName: string
): CustomResourceTarget {
  return {
    type: "custom",
    resourceType: CUSTOM_RESOURCES.instance.resourceType,
    group: CUSTOM_RESOURCES.instance.group,
    version: CUSTOM_RESOURCES.instance.version,
    plural: CUSTOM_RESOURCES.instance.plural,
    name: instanceName,
  };
}

/**
 * Generate query key for listing all instances
 */
export function getListInstancesQueryKey(namespace: string) {
  return ["instances", namespace];
}

/**
 * Generate query key for getting a specific instance
 */
export function getInstanceQueryKey(namespace: string, instanceName: string) {
  return ["instance", "get", namespace, instanceName];
}

/**
 * Generate query key for getting instance resources
 */
export function getInstanceResourcesQueryKey(
  namespace: string,
  instanceName: string
) {
  return ["instance", "resources", namespace, instanceName];
}

/**
 * Get all query keys that should be invalidated when instance data changes
 */
export function getInstanceQueryInvalidationKeys(
  namespace: string,
  instanceName?: string
) {
  const keys = [
    // General instance list queries
    getListInstancesQueryKey(namespace),
    // General inventory and k8s queries that might include instance data
    ["inventory"],
    ["k8s"],
    // Broader instance queries
    ["instances"],
    ["instance", "resources", namespace],
    ["instance", "get", namespace],
  ];

  if (instanceName) {
    // Specific instance queries
    keys.push(getInstanceQueryKey(namespace, instanceName));
    keys.push(getInstanceResourcesQueryKey(namespace, instanceName));
  }

  return keys;
}

/**
 * Helper function to invalidate instance-related queries
 * This ensures consistent invalidation across all mutations
 */
export function invalidateInstanceQueries(
  queryClient: QueryClient,
  namespace: string,
  instanceName?: string
) {
  const invalidationKeys = getInstanceQueryInvalidationKeys(
    namespace,
    instanceName
  );
  invalidationKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}
