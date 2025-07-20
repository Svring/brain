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
import type {
  AppFormConfig,
  DevboxApiContext,
  DevboxCreateRequest,
  DevboxDeployRequest,
  DevboxLifecycleRequest,
  DevboxPortCreateRequest,
  DevboxReleaseRequest,
} from "../schemas";

export function useCreateDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxCreateRequest) =>
      runParallelAction(createDevbox(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "devboxes"] });
    },
  });
}

export function useManageDevboxLifecycleMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxLifecycleRequest) =>
      runParallelAction(manageDevboxLifecycle(request, context)),
    onSuccess: (_data, variables) => {
      if (
        variables &&
        typeof variables === "object" &&
        "devboxName" in variables
      ) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "devbox", "get", variables.devboxName],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox"] });
    },
  });
}

export function useDeleteDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devboxName: string) =>
      runParallelAction(deleteDevbox(devboxName, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox"] });
    },
  });
}

export function useReleaseDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxReleaseRequest) =>
      runParallelAction(releaseDevbox(request, context)),
    onSuccess: (_data, variables) => {
      if (
        variables &&
        typeof variables === "object" &&
        "devboxName" in variables
      ) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "devbox", "releases", variables.devboxName],
        });
      }
    },
  });
}

export function useDeployDevboxMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxDeployRequest) =>
      runParallelAction(deployDevbox(request, context)),
    onSuccess: (_data, variables) => {
      if (
        variables &&
        typeof variables === "object" &&
        "devboxName" in variables
      ) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "devbox", "get", variables.devboxName],
        });
        queryClient.invalidateQueries({ queryKey: ["inventory", "devboxes"] });
      }
    },
  });
}

export function useCreateDevboxPortMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxPortCreateRequest) =>
      runParallelAction(createDevboxPort(request, context)),
    onSuccess: (_data, variables) => {
      if (
        variables &&
        typeof variables === "object" &&
        "devboxName" in variables
      ) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "devbox", "get", variables.devboxName],
        });
      }
    },
  });
}

export function useRemoveDevboxPortMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ devboxName, port }: { devboxName: string; port: number }) =>
      runParallelAction(removeDevboxPort(devboxName, port, context)),
    onSuccess: (_data, variables) => {
      if (
        variables &&
        typeof variables === "object" &&
        "devboxName" in variables
      ) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "devbox", "get", variables.devboxName],
        });
      }
    },
  });
}

export function useCreateAppMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appForm: AppFormConfig) =>
      runParallelAction(createApp(appForm, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "app", "list"] });
    },
  });
}

export function useDeleteAppMutation(context: DevboxApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) =>
      runParallelAction(deleteApp(appName, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "app", "list"] });
    },
  });
}
