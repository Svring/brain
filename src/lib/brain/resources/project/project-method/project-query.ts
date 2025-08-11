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
import { getResourceObject } from "@/lib/sealos/services/bridge/bridge-method/bridge-query";
import { flattenListAllResourcesResponse } from "@/lib/k8s/k8s-method/k8s-utils";
import { convertInstanceListToProjectList } from "./project-utils";

export const listProjects = async (context: K8sApiContext) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("instance")
  );
  const instanceResourceList = await runParallelAction(
    listCustomResources(context, target)
  );
  return convertInstanceListToProjectList(instanceResourceList);
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
  projectName: string,
  enabledSubModules: string[] = [
    "devbox",
    "cluster",
    "deployment",
    "statefulset",
  ]
) => {
  return queryOptions({
    queryKey: ["project", projectName],
    queryFn: async () => {
      const resources = await getProjectRelatedResources(
        context,
        projectName,
        enabledSubModules
      );
      return flattenListAllResourcesResponse(resources).map(
        convertResourceToTarget
      );
    },
    enabled: !!context.namespace && !!projectName && !!context.kubeconfig,
    staleTime: 60 * 1000, // 5 minutes
  });
};
