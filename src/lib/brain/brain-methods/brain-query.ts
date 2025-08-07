import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { queryOptions } from "@tanstack/react-query";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getBrainProjectObject } from "@/lib/algorithm/bridge/bridge-resources/bridge-brain/brain-project/brain-project-bridge-query";
import { runParallelAction } from "next-server-actions-parallel";

export const listBrainProjects = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("instance")
  );
  const instanceResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  const instanceTargetList = instanceResourceList.items.map((item) =>
    CustomResourceTargetSchema.parse(convertResourceToTarget(item))
  );
  const instancePromises = instanceTargetList.map(
    async (target) => await getBrainProject(context, target.name!)
  );
  return await Promise.all(instancePromises);
};

export const getBrainProject = async (context: K8sApiContext, name: string) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("instance", name)
  );
  const brainProjectObject = await getBrainProjectObject(context, target);
  return brainProjectObject;
};

export const listBrainProjectsQuery = (context: K8sApiContext) => {
  return queryOptions({
    queryKey: ["brain-projects"],
    queryFn: () => listBrainProjects(context),
  });
};

export const getBrainProjectQuery = (context: K8sApiContext, name: string) => {
  return queryOptions({
    queryKey: ["brain-project", name],
    queryFn: () => getBrainProject(context, name),
  });
};
