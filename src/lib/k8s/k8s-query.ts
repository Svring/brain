"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  getCustomResource,
  getDeployment,
  getIngress,
  getService,
  listCustomResource,
  listDeployments,
  listIngresses,
  listServices,
} from "./k8s-api";
import { RESOURCES } from "./k8s-constant";
import type {
  GetCustomResourceRequest,
  GetDeploymentRequest,
  GetIngressRequest,
  GetServiceRequest,
  K8sApiContext,
  ListAllResourcesRequest,
  ListCustomResourceRequest,
  ListDeploymentsRequest,
  ListIngressesRequest,
  ListServicesRequest,
  ResourceTarget,
} from "./schemas";

export const listCustomResourceOptions = (
  request: ListCustomResourceRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "custom-resource",
      "list",
      request.group,
      request.version,
      context.namespace,
      request.plural,
      request.labelSelector,
    ],
    queryFn: () => {
      return runParallelAction(
        listCustomResource(
          context.kubeconfig,
          request.group,
          request.version,
          context.namespace,
          request.plural,
          request.labelSelector
        )
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled:
      !!request.group &&
      !!request.version &&
      !!context.namespace &&
      !!request.plural,
  });

export const getCustomResourceOptions = (
  request: GetCustomResourceRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "custom-resource",
      "get",
      request.group,
      request.version,
      context.namespace,
      request.plural,
      request.name,
    ],
    queryFn: () => {
      return runParallelAction(
        getCustomResource(
          context.kubeconfig,
          request.group,
          request.version,
          context.namespace,
          request.plural,
          request.name
        )
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled:
      !!request.group &&
      !!request.version &&
      !!context.namespace &&
      !!request.plural &&
      !!request.name,
  });

export const listDeploymentsOptions = (
  request: ListDeploymentsRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "deployments",
      "list",
      context.namespace,
      request.labelSelector,
    ],
    queryFn: () => {
      return runParallelAction(
        listDeployments(
          context.kubeconfig,
          context.namespace,
          request.labelSelector
        )
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.namespace,
  });

export const getDeploymentOptions = (
  request: GetDeploymentRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: ["k8s", "deployments", "get", context.namespace, request.name],
    queryFn: () => {
      return runParallelAction(
        getDeployment(context.kubeconfig, context.namespace, request.name)
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.namespace && !!request.name,
  });

export const listServicesOptions = (
  request: ListServicesRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "services",
      "list",
      context.namespace,
      request.labelSelector,
    ],
    queryFn: () => {
      return runParallelAction(
        listServices(
          context.kubeconfig,
          context.namespace,
          request.labelSelector
        )
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.namespace,
  });

export const getServiceOptions = (
  request: GetServiceRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: ["k8s", "services", "get", context.namespace, request.name],
    queryFn: () => {
      return runParallelAction(
        getService(context.kubeconfig, context.namespace, request.name)
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.namespace && !!request.name,
  });

export const listIngressesOptions = (
  request: ListIngressesRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "ingresses",
      "list",
      context.namespace,
      request.labelSelector,
    ],
    queryFn: () => {
      return runParallelAction(
        listIngresses(
          context.kubeconfig,
          context.namespace,
          request.labelSelector
        )
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.namespace,
  });

export const getIngressOptions = (
  request: GetIngressRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: ["k8s", "ingresses", "get", context.namespace, request.name],
    queryFn: () => {
      return runParallelAction(
        getIngress(context.kubeconfig, context.namespace, request.name)
      );
    },
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.namespace && !!request.name,
  });

export const getResourceOptions = (
  resource: ResourceTarget,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) => {
  if (resource.type === "custom") {
    return getCustomResourceOptions(
      {
        group: resource.group,
        version: resource.version,
        plural: resource.plural,
        name: resource.name,
      },
      context,
      postprocess ?? ((d) => d)
    );
  }

  if (resource.type === "deployment") {
    return getDeploymentOptions(
      {
        name: resource.name,
      },
      context,
      postprocess ?? ((d) => d)
    );
  }

  throw new Error(`Unknown resource type: ${resource satisfies never}`);
};

export const listAllResourcesOptions = (
  request: ListAllResourcesRequest,
  context: K8sApiContext,
  postprocess?: (data: unknown) => unknown
) =>
  queryOptions({
    queryKey: [
      "k8s",
      "all-resources",
      "list",
      context.namespace,
      request.labelSelector,
    ],
    queryFn: async () => {
      const resourcePromises = Object.entries(RESOURCES).map(([_, config]) =>
        "group" in config
          ? runParallelAction(
              listCustomResource(
                context.kubeconfig,
                config.group,
                config.version,
                context.namespace,
                config.plural,
                request.labelSelector
              )
            )
          : runParallelAction(
              listDeployments(
                context.kubeconfig,
                context.namespace,
                request.labelSelector
              )
            )
      );

      const results = await Promise.all(resourcePromises);
      return Object.fromEntries(
        Object.keys(RESOURCES).map((name, i) => [name, results[i]])
      );
    },
    select: postprocess ?? ((d) => d),
    enabled: !!context.namespace,
  });
