"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createLaunchpad,
  deleteLaunchpad,
  pauseLaunchpad,
  startLaunchpad,
} from "../../launchpad/launchpad-api/launchpad-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { AppCreateRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-create-schemas";
import type { AppDeleteRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-delete-schemas";
import type { AppPauseRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-pause-schemas";
import type { AppStartRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";

export function useCreateStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppCreateRequest) =>
      runParallelAction(createLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}

export function useDeleteStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppDeleteRequest) =>
      runParallelAction(deleteLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}

export function usePauseStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppPauseRequest) =>
      runParallelAction(pauseLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}

export function useStartStatefulSetMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AppStartRequest) =>
      runParallelAction(startLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}
