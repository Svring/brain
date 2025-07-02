"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  getCustomResource,
  getDeployment,
  listCustomResource,
  listDeployments,
} from "./k8s-api";
import { RESOURCES } from "./k8s-constant";
import { getDecodedKubeconfig, getUserKubeconfig } from "./k8s-utils";

export const listCustomResourceOptions = (
  group: string,
  version: string,
  namespace: string,
  plural: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "custom-resource",
      "list",
      group,
      version,
      namespace,
      plural,
    ],
    queryFn: () => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(
        listCustomResource(decodedKc, group, version, namespace, plural)
      );
    },
    select: (data) => postprocess(data),
    enabled: !!group && !!version && !!namespace && !!plural,
  });

export const getCustomResourceOptions = (
  group: string,
  version: string,
  namespace: string,
  plural: string,
  name: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "custom-resource",
      "get",
      group,
      version,
      namespace,
      plural,
      name,
    ],
    queryFn: () => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(
        getCustomResource(decodedKc, group, version, namespace, plural, name)
      );
    },
    select: (data) => postprocess(data),
    enabled: !!group && !!version && !!namespace && !!plural && !!name,
  });

export const listDeploymentsOptions = (
  namespace: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["k8s", "deployments", "list", namespace],
    queryFn: () => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(listDeployments(decodedKc, namespace));
    },
    select: (data) => postprocess(data),
    enabled: !!namespace,
  });

export const getDeploymentOptions = (
  namespace: string,
  name: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["k8s", "deployments", "get", namespace, name],
    queryFn: () => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);
      return runParallelAction(getDeployment(decodedKc, namespace, name));
    },
    select: (data) => postprocess(data),
    enabled: !!namespace && !!name,
  });

export const listAllResourcesOptions = (
  namespace: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["k8s", "all-resources", "list", namespace],
    queryFn: async () => {
      const kc = getUserKubeconfig();
      if (!kc) {
        throw new Error("Kubeconfig not available");
      }
      const decodedKc = getDecodedKubeconfig(kc);

      // Dynamically create promises for all resource types
      const resourcePromises = Object.entries(RESOURCES).map(([, config]) => {
        if ("type" in config && config.type === "custom" && "group" in config) {
          return runParallelAction(
            listCustomResource(
              decodedKc,
              config.group,
              config.version,
              namespace,
              config.plural
            )
          );
        }
        if ("type" in config && config.type === "deployment") {
          return runParallelAction(listDeployments(decodedKc, namespace));
        }
        throw new Error("Unknown resource configuration");
      });

      const results = await Promise.all(resourcePromises);

      // Create result object with resource names as keys
      const resourceNames = Object.keys(RESOURCES);
      const resourceData: Record<string, unknown> = {};

      for (let i = 0; i < resourceNames.length; i++) {
        resourceData[resourceNames[i]] = results[i];
      }

      return resourceData;
    },
    select: (data) => postprocess(data),
    enabled: !!namespace,
  });
