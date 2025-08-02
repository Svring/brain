"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createApp,
  deleteApp,
  pauseApp,
  startApp,
  checkReadyApp,
} from "../app-api/app-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { AppCreateRequest } from "../app-api/app-old-api-schemas/req-res-create-schemas";
import type { AppDeleteRequest } from "../app-api/app-old-api-schemas/req-res-delete-schemas";
import type { AppPauseRequest } from "../app-api/app-old-api-schemas/req-res-pause-schemas";
import type { AppStartRequest } from "../app-api/app-old-api-schemas/req-res-start-schemas";
import type { AppCheckReadyRequest } from "../app-api/app-old-api-schemas/req-res-check-ready-schemas";

export function useCreateAppMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppCreateRequest) =>
      runParallelAction(createApp(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "app", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "apps"],
      });
    },
  });
}

export function useDeleteAppMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppDeleteRequest) =>
      runParallelAction(deleteApp(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "app", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "apps"],
      });
    },
  });
}

export function useStopAppMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppPauseRequest) =>
      runParallelAction(pauseApp(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "app", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "apps"],
      });
    },
  });
}

export function useStartAppMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppStartRequest) =>
      runParallelAction(startApp(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "app", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "apps"],
      });
    },
  });
}

export function useCheckReadyAppMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppCheckReadyRequest) =>
      runParallelAction(checkReadyApp(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "app", "checkReady"],
      });
    },
  });
}
