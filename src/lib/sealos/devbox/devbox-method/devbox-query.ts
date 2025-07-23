"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  getAppByName,
  getAppPods,
  getApps,
  getDevboxByName,
  getDevboxList,
  getDevboxReleases,
} from "../devbox-api/devbox-open-api";
import type { DevboxApiContext } from "../schemas";
import { getDevboxRelatedResources } from "@/lib/algorithm/relevance/devbox-relevance";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";

export const listDevboxOptions = (context: DevboxApiContext) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "list"],
    queryFn: () => runParallelAction(getDevboxList(context)),
  });

export const getDevboxOptions = (
  context: DevboxApiContext,
  devboxName: string
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "get", devboxName],
    queryFn: () => runParallelAction(getDevboxByName(devboxName, context)),
  });

export const getDevboxReleasesOptions = (
  context: DevboxApiContext,
  devboxName: string
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "releases", devboxName],
    queryFn: () => runParallelAction(getDevboxReleases(devboxName, context)),
  });

export const listAppsOptions = (context: DevboxApiContext) =>
  queryOptions({
    queryKey: ["sealos", "app", "list"],
    queryFn: () => runParallelAction(getApps(context)),
  });

export const getAppOptions = (context: DevboxApiContext, appName: string) =>
  queryOptions({
    queryKey: ["sealos", "app", "get", appName],
    queryFn: () => runParallelAction(getAppByName(appName, context)),
  });

export const getAppPodsOptions = (context: DevboxApiContext, appName: string) =>
  queryOptions({
    queryKey: ["sealos", "app", "pods", appName],
    queryFn: () => runParallelAction(getAppPods(appName, context)),
  });

/**
 * Query options for getting all resources related to a specific devbox
 * This includes ingresses, services, issuers, and certificates with the devbox label
 */
export const getDevboxRelatedResourcesOptions = (
  context: K8sApiContext,
  devboxName: string
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "related-resources", devboxName],
    queryFn: async () => {
      const resources = await getDevboxRelatedResources(context, devboxName);
      return resources;
    },
    enabled: !!context.namespace && !!devboxName && !!context.kubeconfig,
    staleTime: 30 * 1000, // 30 seconds
  });
