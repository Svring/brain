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
import { getDecodedKubeconfig } from "./k8s-utils";
import type {
  GetCustomResourceRequest,
  GetDeploymentRequest,
  ListAllResourcesRequest,
  ListCustomResourceRequest,
  ListDeploymentsRequest,
  ResourceTarget,
} from "./schemas";

export const listCustomResourceOptions = (
  request: ListCustomResourceRequest,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "custom-resource",
      "list",
      request.group,
      request.version,
      request.namespace,
      request.plural,
      request.labelSelector,
    ],
    queryFn: () => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        listCustomResource(
          decodedKc,
          request.group,
          request.version,
          request.namespace,
          request.plural,
          request.labelSelector
        )
      );
    },
    select: (data) => postprocess(data),
    enabled:
      !!request.group &&
      !!request.version &&
      !!request.namespace &&
      !!request.plural,
  });

export const getCustomResourceOptions = (
  request: GetCustomResourceRequest,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "custom-resource",
      "get",
      request.group,
      request.version,
      request.namespace,
      request.plural,
      request.name,
    ],
    queryFn: () => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        getCustomResource(
          decodedKc,
          request.group,
          request.version,
          request.namespace,
          request.plural,
          request.name
        )
      );
    },
    select: (data) => postprocess(data),
    enabled:
      !!request.group &&
      !!request.version &&
      !!request.namespace &&
      !!request.plural &&
      !!request.name,
  });

export const listDeploymentsOptions = (
  request: ListDeploymentsRequest,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "deployments",
      "list",
      request.namespace,
      request.labelSelector,
    ],
    queryFn: () => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        listDeployments(decodedKc, request.namespace, request.labelSelector)
      );
    },
    select: (data) => postprocess(data),
    enabled: !!request.namespace,
  });

export const getDeploymentOptions = (
  request: GetDeploymentRequest,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["k8s", "deployments", "get", request.namespace, request.name],
    queryFn: () => {
      const decodedKc = getDecodedKubeconfig();
      return runParallelAction(
        getDeployment(decodedKc, request.namespace, request.name)
      );
    },
    select: (data) => postprocess(data),
    enabled: !!request.namespace && !!request.name,
  });

export const getResourceOptions = (
  resource: ResourceTarget,
  postprocess: (data: unknown) => unknown = (d) => d
) => {
  if (resource.type === "custom") {
    return getCustomResourceOptions(
      {
        group: resource.group,
        version: resource.version,
        namespace: resource.namespace,
        plural: resource.plural,
        name: resource.name,
      },
      postprocess
    );
  }

  if (resource.type === "deployment") {
    return getDeploymentOptions(
      {
        namespace: resource.namespace,
        name: resource.name,
      },
      postprocess
    );
  }

  throw new Error(`Unknown resource type: ${resource satisfies never}`);
};

export const listAllResourcesOptions = (
  request: ListAllResourcesRequest,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "all-resources",
      "list",
      request.namespace,
      request.labelSelector,
    ],
    queryFn: async () => {
      const decodedKc = getDecodedKubeconfig();
      const resourcePromises = Object.entries(RESOURCES).map(([_, config]) =>
        "group" in config
          ? runParallelAction(
              listCustomResource(
                decodedKc,
                config.group,
                config.version,
                request.namespace,
                config.plural,
                request.labelSelector
              )
            )
          : runParallelAction(
              listDeployments(
                decodedKc,
                request.namespace,
                request.labelSelector
              )
            )
      );

      const results = await Promise.all(resourcePromises);
      return Object.fromEntries(
        Object.keys(RESOURCES).map((name, i) => [name, results[i]])
      );
    },
    select: postprocess,
    enabled: !!request.namespace,
  });
