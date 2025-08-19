"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  deleteLaunchpad,
  pauseLaunchpad,
  startLaunchpad,
  checkReadyLaunchpad,
} from "../launchpad-api/launchpad-old-api";
import {
  createApplication,
  updateApplication,
  updateApplicationConfigMap,
  updateApplicationPorts,
} from "../launchpad-api/launchpad-open-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type {
  LaunchpadCreateRequest,
  LaunchpadPatchRequest,
  LaunchpadConfigMapUpdateRequest,
  LaunchpadPortsUpdateRequest,
} from "../launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import type { LaunchpadDeleteRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-delete-schemas";
import type { LaunchpadPauseRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-pause-schemas";
import type { LaunchpadStartRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-start-schemas";
import type { LaunchpadCheckReadyRequest } from "../launchpad-api/launchpad-old-api-schemas/req-res-check-ready-schemas";

export function useCreateLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadCreateRequest) =>
      runParallelAction(createApplication(context, request)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["deployment"],
      });
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}

export function useUpdateLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: { name: string; data: LaunchpadPatchRequest }) =>
      runParallelAction(updateApplication(context, request.name, request.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["deployment"],
      });
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}

export function useUpdateLaunchpadConfigMapMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: {
      name: string;
      data: LaunchpadConfigMapUpdateRequest;
    }) =>
      runParallelAction(
        updateApplicationConfigMap(context, request.name, request.data)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["deployment"],
      });
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}

export function useUpdateLaunchpadPortsMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: {
      name: string;
      data: LaunchpadPortsUpdateRequest;
    }) =>
      runParallelAction(
        updateApplicationPorts(context, request.name, request.data)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["deployment"],
      });
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
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
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["deployment"],
      });
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });
    },
  });
}

export function usePauseLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadPauseRequest) =>
      runParallelAction(pauseLaunchpad(request, context)),
    onSuccess: (_, request) => {
      // Immediate invalidation
      queryClient.invalidateQueries({
        queryKey: ["deployment"],
      });
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });

      // Start polling for status changes after lifecycle actions
      const startPolling = () => {
        let pollCount = 0;
        const maxPolls = 30; // Poll for up to 150 seconds
        const pollInterval = 5000; // Poll every 5 seconds

        const poll = () => {
          pollCount++;
          queryClient.invalidateQueries({
            queryKey: ["deployment"],
          });
          queryClient.invalidateQueries({
            queryKey: ["statefulset"],
          });

          if (pollCount < maxPolls) {
            setTimeout(poll, pollInterval);
          }
        };

        setTimeout(poll, pollInterval);
      };

      startPolling();
    },
  });
}

export function useStartLaunchpadMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LaunchpadStartRequest) =>
      runParallelAction(startLaunchpad(request, context)),
    onSuccess: (_, request) => {
      // Immediate invalidation
      queryClient.invalidateQueries({
        queryKey: ["deployment"],
      });
      queryClient.invalidateQueries({
        queryKey: ["statefulset"],
      });

      // Start polling for status changes after lifecycle actions
      const startPolling = () => {
        let pollCount = 0;
        const maxPolls = 30; // Poll for up to 150 seconds
        const pollInterval = 5000; // Poll every 5 seconds

        const poll = () => {
          pollCount++;
          queryClient.invalidateQueries({
            queryKey: ["deployment"],
          });
          queryClient.invalidateQueries({
            queryKey: ["statefulset"],
          });

          if (pollCount < maxPolls) {
            setTimeout(poll, pollInterval);
          }
        };

        setTimeout(poll, pollInterval);
      };

      startPolling();
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
