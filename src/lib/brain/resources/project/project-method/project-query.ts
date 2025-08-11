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
import { getResourceObject } from "@/lib/sealos/services/bridge/bridge-method/bridge-query";

export const listProjects = async (context: K8sApiContext) => {
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
    async (target) => await getProject(context, target.name!)
  );
  return await Promise.all(instancePromises);
};

export const getProject = async (context: K8sApiContext, name: string) => {
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("instance", name)
  );
  const projectObject = await getProjectObject(context, target);
  return projectObject;
};

export const listProjectsQuery = (context: K8sApiContext) => {
  return queryOptions({
    queryKey: ["projects"],
    queryFn: () => listProjects(context),
  });
};

export const getProjectQuery = (context: K8sApiContext, name: string) => {
  return queryOptions({
    queryKey: ["project", name],
    queryFn: () => getProject(context, name),
  });
};

export const getProjectResources = async (
  context: K8sApiContext,
  projectName: string
) => {
  const project = await getProject(context, projectName);
  const results = await Promise.all(
    project.metadata.resources.map(async (resource) => {
      const devObject = resource.backboneResources.dev
        ? await getResourceObject(
            context,
            resource.backboneResources.dev
          ).catch(() => null)
        : null;

      const prodObject = resource.backboneResources.prod
        ? await getResourceObject(
            context,
            resource.backboneResources.prod
          ).catch(() => null)
        : null;

      return {
        ...resource,
        backboneResources: {
          ...resource.backboneResources,
          dev: devObject,
          prod: prodObject,
        },
      };
    })
  );
  return results;
};

export const getProjectResourcesQuery = (
  context: K8sApiContext,
  projectName: string
) => {
  return queryOptions({
    queryKey: ["project-resources", projectName],
    queryFn: () => getProjectResources(context, projectName),
  });
};
