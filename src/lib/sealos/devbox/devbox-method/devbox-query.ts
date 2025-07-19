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
