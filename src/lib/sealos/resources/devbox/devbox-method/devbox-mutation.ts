"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createApp,
  createDevbox,
  createDevboxPort,
  deleteApp,
  deleteDevbox,
  deployDevbox,
  manageDevboxLifecycle,
  releaseDevbox,
  removeDevboxPort,
} from "../devbox-api/devbox-open-api";
import { deleteDevboxRelease } from "../devbox-api/devbox-old-api";
import type {
  AppFormConfig,
  DevboxApiContext,
  DevboxCreateRequest,
  DevboxDeployRequest,
  DevboxLifecycleRequest,
  DevboxPortCreateRequest,
  DevboxReleaseRequest,
} from "../devbox-api/devbox-open-api-schemas/index";

export function useCreateDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxCreateRequest) =>
      runParallelAction(createDevbox(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useManageDevboxLifecycleMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxLifecycleRequest) =>
      runParallelAction(manageDevboxLifecycle(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useDeleteDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devboxName: string) =>
      runParallelAction(deleteDevbox(devboxName, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useReleaseDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxReleaseRequest) =>
      runParallelAction(releaseDevbox(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useDeployDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxDeployRequest) =>
      runParallelAction(deployDevbox(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app"] });
    },
  });
}

export function useCreateDevboxPortMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxPortCreateRequest) =>
      runParallelAction(createDevboxPort(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useRemoveDevboxPortMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ devboxName, port }: { devboxName: string; port: number }) =>
      runParallelAction(removeDevboxPort(devboxName, port, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useCreateAppMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appForm: AppFormConfig) =>
      runParallelAction(createApp(appForm, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useDeleteAppMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) =>
      runParallelAction(deleteApp(appName, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });
}

export function useDeleteDevboxReleaseMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionName: string) =>
      runParallelAction(deleteDevboxRelease(context, versionName)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release"] });
    },
  });
}
