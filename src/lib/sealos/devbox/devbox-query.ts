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
import { getDevboxAPIContext } from "./devbox-utils";

export const listDevboxOptions = (
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "list"],
    queryFn: () => runParallelAction(getDevboxList(getDevboxAPIContext())),
    select: (data) => postprocess(data),
  });

export const getDevboxOptions = (
  devboxName: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "get", devboxName],
    queryFn: () =>
      runParallelAction(getDevboxByName(devboxName, getDevboxAPIContext())),
    select: (data) => postprocess(data),
    enabled: !!devboxName,
  });

export const getDevboxReleasesOptions = (
  devboxName: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["sealos", "devbox", "releases", devboxName],
    queryFn: () =>
      runParallelAction(getDevboxReleases(devboxName, getDevboxAPIContext())),
    select: (data) => postprocess(data),
    enabled: !!devboxName,
  });

export const listAppsOptions = (
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["sealos", "app", "list"],
    queryFn: () => runParallelAction(getApps(getDevboxAPIContext())),
    select: (data) => postprocess(data),
  });

export const getAppOptions = (
  appName: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["sealos", "app", "get", appName],
    queryFn: () =>
      runParallelAction(getAppByName(appName, getDevboxAPIContext())),
    select: (data) => postprocess(data),
    enabled: !!appName,
  });

export const getAppPodsOptions = (
  appName: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  queryOptions({
    queryKey: ["sealos", "app", "pods", appName],
    queryFn: () =>
      runParallelAction(getAppPods(appName, getDevboxAPIContext())),
    select: (data) => postprocess(data),
    enabled: !!appName,
  });

export {
  listDevboxIngressesOptions,
  listDevboxServicesOptions,
} from "./devbox-k8s-api";
