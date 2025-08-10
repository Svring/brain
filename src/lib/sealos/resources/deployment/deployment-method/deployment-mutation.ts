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
import type { LaunchpadCreateRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-create-schemas";
import type { LaunchpadDeleteRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-delete-schemas";
import type { LaunchpadPauseRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-pause-schemas";
import type { LaunchpadStartRequest } from "../../launchpad/launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";

export function useCreateDeployMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadCreateRequest) =>
      runParallelAction(createLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment"] });
    },
  });
}

export function useDeleteDeployMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadDeleteRequest) =>
      runParallelAction(deleteLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment"] });
    },
  });
}

export function usePauseDeployMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadPauseRequest) =>
      runParallelAction(pauseLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment"] });
    },
  });
}

export function useStartDeployMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadStartRequest) =>
      runParallelAction(startLaunchpad(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment"] });
    },
  });
}
