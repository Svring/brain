import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { getBuiltinResource, getCustomResource } from "@/lib/k8s/k8s-api/k8s-api-query";
import { CLUSTER_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import _ from "lodash";

export const getClusterRelatedResources = async (context: K8sApiContext, clusterName: string) => {
  const labelSelector = `${CLUSTER_RELATE_RESOURCE_LABELS.APP_KUBERNETES_INSTANCE}=${clusterName}`;
  
  // Get resources by label
  const labeledResourcesResult = await listAllResources(context, labelSelector);
  
  const allItems: any[] = [];
  if (labeledResourcesResult) {
      _.forEach(labeledResourcesResult.builtin, (resourceList) => {
          if (resourceList && resourceList.items) {
              allItems.push(...resourceList.items);
          }
      });
      _.forEach(labeledResourcesResult.custom, (resourceList) => {
          if (resourceList && resourceList.items) {
              allItems.push(...resourceList.items);
          }
      });
  }


  // Get resources by name, based on useDeleteClusterRelatedMutation
  const namedResourcePromises = [
    getBuiltinResource(context, { type: 'builtin', resourceType: 'service', name: `${clusterName}-export` }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'role', name: clusterName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'rolebinding', name: clusterName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'serviceaccount', name: clusterName }),
  ];

  if (CUSTOM_RESOURCES.cluster) {
    namedResourcePromises.push(
      getCustomResource(context, {
        type: 'custom',
        group: CUSTOM_RESOURCES.cluster.group,
        version: CUSTOM_RESOURCES.cluster.version,
        plural: CUSTOM_RESOURCES.cluster.plural,
        name: clusterName,
      })
    );
  }

  const namedResourceResults = await Promise.allSettled(namedResourcePromises);

  namedResourceResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value && Object.keys(result.value).length > 0) {
      allItems.push(result.value);
    }
  });

  // Remove duplicates, as some resources might be fetched by both label and name
  return _.uniqWith(allItems, (a, b) => 
    a.metadata?.selfLink === b.metadata?.selfLink ||
    (a.kind === b.kind && a.metadata?.name === b.metadata?.name && a.metadata?.namespace === b.metadata?.namespace)
  );
};