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
} from "./devbox-api";
import { getDevboxAPIContext } from "./devbox-utils";
import type {
  AppFormConfig,
  DevboxCreateRequest,
  DevboxDeployRequest,
  DevboxLifecycleRequest,
  DevboxPortCreateRequest,
  DevboxReleaseRequest,
} from "./schemas";

export function useCreateDevboxMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxCreateRequest) =>
      runParallelAction(createDevbox(request, getDevboxAPIContext())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox", "list"] });
    },
  });
}

export function useManageDevboxLifecycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxLifecycleRequest) =>
      runParallelAction(manageDevboxLifecycle(request, getDevboxAPIContext())),
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
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox", "list"] });
    },
  });
}

export function useDeleteDevboxMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devboxName: string) =>
      runParallelAction(deleteDevbox(devboxName, getDevboxAPIContext())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox", "list"] });
    },
  });
}

export function useReleaseDevboxMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxReleaseRequest) =>
      runParallelAction(releaseDevbox(request, getDevboxAPIContext())),
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

export function useDeployDevboxMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxDeployRequest) =>
      runParallelAction(deployDevbox(request, getDevboxAPIContext())),
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

export function useCreateDevboxPortMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DevboxPortCreateRequest) =>
      runParallelAction(createDevboxPort(request, getDevboxAPIContext())),
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

export function useRemoveDevboxPortMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ devboxName, port }: { devboxName: string; port: number }) =>
      runParallelAction(
        removeDevboxPort(devboxName, port, getDevboxAPIContext())
      ),
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

export function useCreateAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appForm: AppFormConfig) =>
      runParallelAction(createApp(appForm, getDevboxAPIContext())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "app", "list"] });
    },
  });
}

export function useDeleteAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appName: string) =>
      runParallelAction(deleteApp(appName, getDevboxAPIContext())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "app", "list"] });
    },
  });
}
