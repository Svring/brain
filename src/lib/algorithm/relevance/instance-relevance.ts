import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import { getBuiltinResource, getCustomResource } from "@/lib/k8s/k8s-api/k8s-api-query";
import { PROJECT_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import _ from "lodash";

export const getInstanceRelatedResources = async (context: K8sApiContext, instanceName: string) => {
  const allItems: any[] = [];

  // 1. Get resources by label selectors
  const labelSelectors = [
    `${PROJECT_RELATE_RESOURCE_LABELS.MANAGED_BY}=${instanceName}`,
    `${PROJECT_RELATE_RESOURCE_LABELS.APP}=${instanceName}`,
  ];

  const labeledResourcesPromises = labelSelectors.map(selector => listAllResources(context, selector));
  const labeledResourcesResults = await Promise.allSettled(labeledResourcesPromises);

  labeledResourcesResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      _.forEach(result.value.builtin, (resourceList) => {
        if (resourceList && resourceList.items) {
          allItems.push(...resourceList.items);
        }
      });
      _.forEach(result.value.custom, (resourceList) => {
        if (resourceList && resourceList.items) {
          allItems.push(...resourceList.items);
        }
      });
    }
  });

  // 2. Get resources by name, based on useDeleteInstanceRelatedMutation
  const namedResourcePromises = [
    getBuiltinResource(context, { type: 'builtin', resourceType: 'configmap', name: instanceName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'secret', name: instanceName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'horizontalpodautoscaler', name: instanceName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'job', name: instanceName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'cronjob', name: instanceName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'deployment', name: instanceName }),
    getBuiltinResource(context, { type: 'builtin', resourceType: 'statefulset', name: instanceName }),
  ];

  if (CUSTOM_RESOURCES.app) {
    namedResourcePromises.push(
      getCustomResource(context, {
        type: 'custom',
        group: CUSTOM_RESOURCES.app.group,
        version: CUSTOM_RESOURCES.app.version,
        plural: CUSTOM_RESOURCES.app.plural,
        name: instanceName,
      })
    );
  }

  const namedResourceResults = await Promise.allSettled(namedResourcePromises);

  namedResourceResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value && Object.keys(result.value).length > 0) {
      allItems.push(result.value);
    }
  });

  // 3. Remove duplicates
  return _.uniqWith(allItems, (a, b) => 
    a.metadata?.selfLink === b.metadata?.selfLink ||
    (a.kind === b.kind && a.metadata?.name === b.metadata?.name && a.metadata?.namespace === b.metadata?.namespace)
  );
};