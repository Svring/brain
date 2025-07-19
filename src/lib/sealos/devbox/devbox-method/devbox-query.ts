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
import type {
  DevboxApiContext,
  DevboxGetResponse,
  DevboxListResponse,
  DevboxReleasesResponse,
  GetAppByNameResponse,
  GetAppPodsResponse,
  GetAppsResponse,
} from "../schemas";

export const listDevboxOptions =
  (
    context: DevboxApiContext,
    postprocess?: (data: DevboxListResponse) => unknown
  ) =>
  () =>
    queryOptions({
      queryKey: ["sealos", "devbox", "list"],
      queryFn: () => runParallelAction(getDevboxList(context)),
      select: (data) => postprocess?.(data) ?? data,
    });

export const getDevboxOptions =
  (
    context: DevboxApiContext,
    postprocess?: (data: DevboxGetResponse) => unknown
  ) =>
  (devboxName: string) =>
    queryOptions({
      queryKey: ["sealos", "devbox", "get", devboxName],
      queryFn: () => runParallelAction(getDevboxByName(devboxName, context)),
      select: (data) => postprocess?.(data) ?? data,
      enabled: !!devboxName,
    });

export const getDevboxReleasesOptions =
  (
    context: DevboxApiContext,
    postprocess?: (data: DevboxReleasesResponse) => unknown
  ) =>
  (devboxName: string) =>
    queryOptions({
      queryKey: ["sealos", "devbox", "releases", devboxName],
      queryFn: () => runParallelAction(getDevboxReleases(devboxName, context)),
      select: (data) => postprocess?.(data) ?? data,
      enabled: !!devboxName,
    });

export const listAppsOptions =
  (
    context: DevboxApiContext,
    postprocess?: (data: GetAppsResponse) => unknown
  ) =>
  () =>
    queryOptions({
      queryKey: ["sealos", "app", "list"],
      queryFn: () => runParallelAction(getApps(context)),
      select: (data) => postprocess?.(data) ?? data,
    });

export const getAppOptions =
  (
    context: DevboxApiContext,
    postprocess?: (data: GetAppByNameResponse) => unknown
  ) =>
  (appName: string) =>
    queryOptions({
      queryKey: ["sealos", "app", "get", appName],
      queryFn: () => runParallelAction(getAppByName(appName, context)),
      select: (data) => postprocess?.(data) ?? data,
      enabled: !!appName,
    });

export const getAppPodsOptions =
  (
    context: DevboxApiContext,
    postprocess?: (data: GetAppPodsResponse) => unknown
  ) =>
  (appName: string) =>
    queryOptions({
      queryKey: ["sealos", "app", "pods", appName],
      queryFn: () => runParallelAction(getAppPods(appName, context)),
      select: (data) => postprocess?.(data) ?? data,
      enabled: !!appName,
    });
