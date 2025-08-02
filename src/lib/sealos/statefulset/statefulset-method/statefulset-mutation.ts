"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createApp,
  deleteApp,
  pauseApp,
  startApp,
} from "../../app/app-api/app-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { AppCreateRequest } from "../../app/app-api/app-old-api-schemas/req-res-create-schemas";
import type { AppDeleteRequest } from "../../app/app-api/app-old-api-schemas/req-res-delete-schemas";
import type { AppPauseRequest } from "../../app/app-api/app-old-api-schemas/req-res-pause-schemas";
import type { AppStartRequest } from "../../app/app-api/app-old-api-schemas/req-res-start-schemas";

export function useCreateStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppCreateRequest) =>
      runParallelAction(createApp(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "statefulset", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "statefulsets"],
      });
    },
  });
}

export function useDeleteStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppDeleteRequest) =>
      runParallelAction(deleteApp(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "statefulset", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "statefulsets"],
      });
    },
  });
}

export function usePauseStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppPauseRequest) =>
      runParallelAction(pauseApp(request, context)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "statefulset", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "statefulsets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sealos", "statefulset", "get", variables.appName],
      });
    },
  });
}

export function useStartStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppStartRequest) =>
      runParallelAction(startApp(request, context)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "statefulset", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "statefulsets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sealos", "statefulset", "get", variables.appName],
      });
    },
  });
}
