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
        queryKey: ["project"],
      });
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
            queryKey: ["project"],
          });
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
        queryKey: ["project"],
      });
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
            queryKey: ["project"],
          });
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
