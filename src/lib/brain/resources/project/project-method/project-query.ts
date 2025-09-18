import { listCustomResources } from "@/lib/k8s/k8s-api/k8s-api-query";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { queryOptions } from "@tanstack/react-query";
import {
  convertResourceTypeToTarget,
  convertResourceToTarget,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getProjectObject } from "./project-bridge";
import { runParallelAction } from "next-server-actions-parallel";
import { getProjectRelatedResources } from "./project-relevance";
import { flattenListAllResourcesResponse } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  convertInstanceListToProjectList,
  filterUnwantedInstances,
} from "./project-utils";

export const listProjects = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("instance")
  );
  // console.log("context", context);
  const instanceResourceList = await runParallelAction(
    listCustomResources(context, target)
  );

  // Filter out unwanted instances before converting to project list
  const filteredInstanceResourceList =
    filterUnwantedInstances(instanceResourceList);

  return convertInstanceListToProjectList(filteredInstanceResourceList);
};

export const getProject = async (context: K8sApiContext, name: string) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("instance", name)
  );
  const projectObject = await getProjectObject(context, target);
  return projectObject;
};

export const listProjectsOptions = (context: K8sApiContext) => {
  return queryOptions({
    queryKey: ["projects"],
    queryFn: () => listProjects(context),
  });
};

export const getProjectOptions = (context: K8sApiContext, name: string) => {
  return queryOptions({
    queryKey: ["project", name],
    queryFn: () => getProject(context, name),
  });
};

export const getProjectResourcesOptions = (
  context: K8sApiContext,
  name: string,
  enabledSubModules: string[] = [
    "devbox",
    "cluster",
    "deployment",
    "statefulset",
  ]
) => {
  return queryOptions({
    queryKey: ["project", "resources", name],
    queryFn: async () => {
      const resources = await getProjectRelatedResources(
        context,
        name,
        enabledSubModules
      );
      return flattenListAllResourcesResponse(resources).map(
        convertResourceToTarget
      );
    },
    enabled: !!context.namespace && !!name && !!context.kubeconfig,
  });
};
