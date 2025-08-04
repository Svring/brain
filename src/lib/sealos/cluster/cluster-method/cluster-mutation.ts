"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createCluster,
  startCluster,
  pauseCluster,
  deleteCluster,
  deleteBackup,
} from "../cluster-api/cluster-old-api";
import type { ClusterApiContext } from "../schemas/cluster-api-context-schemas";
import type {
  ClusterCreateRequest,
  ClusterCreateResponse,
} from "../schemas/req-res-schemas/req-res-create-schemas";
import type {
  ClusterStartRequest,
  ClusterStartResponse,
} from "../schemas/req-res-schemas/req-res-start-schemas";
import type {
  ClusterPauseRequest,
  ClusterPauseResponse,
} from "../schemas/req-res-schemas/req-res-pause-schemas";
import type {
  ClusterDeleteRequest,
  ClusterDeleteResponse,
} from "../schemas/req-res-schemas/req-res-delete-schemas";
import type {
  ClusterBackupDeleteRequest,
  ClusterBackupDeleteResponse,
} from "../schemas/req-res-schemas/req-res-delete-backup-schemas";

export function useCreateClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterCreateResponse, unknown, ClusterCreateRequest>({
    mutationFn: (request: ClusterCreateRequest) =>
      runParallelAction(createCluster(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["cluster"], ["project"]],
      });
    },
  });
}

export function useStartClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterStartResponse, unknown, ClusterStartRequest>({
    mutationFn: (request: ClusterStartRequest) =>
      runParallelAction(startCluster(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["cluster"], ["project"]],
      });
    },
  });
}

export function useStopClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterPauseResponse, unknown, ClusterPauseRequest>({
    mutationFn: (request: ClusterPauseRequest) =>
      runParallelAction(pauseCluster(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cluster"],
      });
    },
  });
}

export function useDeleteClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterDeleteResponse, unknown, ClusterDeleteRequest>({
    mutationFn: (request: ClusterDeleteRequest) =>
      runParallelAction(deleteCluster(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["cluster"], ["project"]],
      });
    },
  });
}

export function useDeleteBackupMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<
    ClusterBackupDeleteResponse,
    unknown,
    ClusterBackupDeleteRequest
  >({
    mutationFn: (request: ClusterBackupDeleteRequest) =>
      runParallelAction(deleteBackup(request, context)),
    onSuccess: () => {
      // Invalidate backup list queries to refresh the backup list
      queryClient.invalidateQueries({
        queryKey: ["backup"],
      });
    },
  });
}
