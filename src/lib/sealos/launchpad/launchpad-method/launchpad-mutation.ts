"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createLaunchpad,
  deleteLaunchpad,
  pauseLaunchpad,
  startLaunchpad,
  checkReadyLaunchpad,
} from "../launchpad-api/launchpad-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { LaunchpadCreateRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-create-schemas";
import type { LaunchpadDeleteRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-delete-schemas";
import type { LaunchpadPauseRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-pause-schemas";
import type { LaunchpadStartRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";
import type { LaunchpadCheckReadyRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-check-ready-schemas";

export function useCreateLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadCreateRequest) =>
      runParallelAction(createLaunchpad(request, context)),
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

export function useDeleteLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadDeleteRequest) =>
      runParallelAction(deleteLaunchpad(request, context)),
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

export function usePauseLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadPauseRequest) =>
      runParallelAction(pauseLaunchpad(request, context)),
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

export function useStartLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadStartRequest) =>
      runParallelAction(startLaunchpad(request, context)),
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

export function useCheckReadyLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadCheckReadyRequest) =>
      runParallelAction(checkReadyLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "app", "checkReady"],
      });
    },
  });
}
