import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { getCustomResource } from "@/lib/k8s/k8s-method/k8s-query";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { getInstanceRelatedResources } from "./instance-relevance";
import { getDevboxRelatedResources } from "./devbox-relevance";
import { getClusterRelatedResources } from "./cluster-relevance";
import { getDeployRelatedResources } from "./deploy-relevance";
import _ from "lodash";

export const getProjectRelatedResources = async (
  context: K8sApiContext,
  projectName: string
) => {
  const projectInstance = await getCustomResource(context, {
    type: "custom",
    group: CUSTOM_RESOURCES.instance.group,
    version: CUSTOM_RESOURCES.instance.version,
    plural: CUSTOM_RESOURCES.instance.plural,
    name: projectName,
  });

  if (!projectInstance) {
    return [];
  }

  let allItems: any[] = [projectInstance];

  const instanceRelatedResources = await getInstanceRelatedResources(
    context,
    projectName
  );
  allItems.push(...instanceRelatedResources);

  const devboxNames: string[] = [];
  const clusterNames: string[] = [];
  const deployNames: string[] = [];

  instanceRelatedResources.forEach((resource) => {
    if (resource.kind === "Devbox") {
      devboxNames.push(resource.metadata.name);
    } else if (resource.kind === "Cluster") {
      clusterNames.push(resource.metadata.name);
    } else if (resource.kind === "Deployment") {
      deployNames.push(resource.metadata.name);
    }
  });

  const devboxRelatedResources = await Promise.all(
    devboxNames.map((name) => getDevboxRelatedResources(context, name))
  );
  const clusterRelatedResources = await Promise.all(
    clusterNames.map((name) => getClusterRelatedResources(context, name))
  );
  const deployRelatedResources = await Promise.all(
    deployNames.map((name) => getDeployRelatedResources(context, name))
  );

  allItems.push(
    ...devboxRelatedResources.flat(),
    ...clusterRelatedResources.flat(),
    ...deployRelatedResources.flat()
  );

  return _.uniqWith(
    allItems,
    (a, b) =>
      a.metadata?.selfLink === b.metadata?.selfLink ||
      (a.kind === b.kind &&
        a.metadata?.name === b.metadata?.name &&
        a.metadata?.namespace === b.metadata?.namespace)
  );
};