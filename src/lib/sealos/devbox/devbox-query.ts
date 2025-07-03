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
} from "./devbox-open-api";
import type {
  DevboxApiContext,
  DevboxGetResponse,
  DevboxListResponse,
  DevboxReleasesResponse,
  GetAppByNameResponse,
  GetAppPodsResponse,
  GetAppsResponse,
} from "./schemas";

export const listDevboxOptions = (
  context: DevboxApiContext,
  postprocess?: (data: DevboxListResponse) => unknown
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "list"],
    queryFn: () => runParallelAction(getDevboxList(context)),
    select: (data) => postprocess?.(data) ?? data,
  });

export const getDevboxOptions = (
  devboxName: string,
  context: DevboxApiContext,
  postprocess?: (data: DevboxGetResponse) => unknown
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "get", devboxName],
    queryFn: () => runParallelAction(getDevboxByName(devboxName, context)),
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!devboxName,
  });

export const getDevboxReleasesOptions = (
  devboxName: string,
  context: DevboxApiContext,
  postprocess?: (data: DevboxReleasesResponse) => unknown
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "releases", devboxName],
    queryFn: () => runParallelAction(getDevboxReleases(devboxName, context)),
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!devboxName,
  });

export const listAppsOptions = (
  context: DevboxApiContext,
  postprocess?: (data: GetAppsResponse) => unknown
) =>
  queryOptions({
    queryKey: ["sealos", "app", "list"],
    queryFn: () => runParallelAction(getApps(context)),
    select: (data) => postprocess?.(data) ?? data,
  });

export const getAppOptions = (
  appName: string,
  context: DevboxApiContext,
  postprocess?: (data: GetAppByNameResponse) => unknown
) =>
  queryOptions({
    queryKey: ["sealos", "app", "get", appName],
    queryFn: () => runParallelAction(getAppByName(appName, context)),
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!appName,
  });

export const getAppPodsOptions = (
  appName: string,
  context: DevboxApiContext,
  postprocess?: (data: GetAppPodsResponse) => unknown
) =>
  queryOptions({
    queryKey: ["sealos", "app", "pods", appName],
    queryFn: () => runParallelAction(getAppPods(appName, context)),
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!appName,
  });

export {
  listDevboxIngressesOptions,
  listDevboxServicesOptions,
} from "./devbox-k8s-api";
