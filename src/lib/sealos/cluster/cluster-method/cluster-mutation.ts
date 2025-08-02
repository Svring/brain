"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createCluster,
  startCluster,
  pauseCluster,
  deleteCluster,
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

export function useCreateClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterCreateResponse, unknown, ClusterCreateRequest>({
    mutationFn: (request: ClusterCreateRequest) =>
      runParallelAction(createCluster(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "cluster", "list"],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", "clusters"] });
    },
  });
}

export function useStartClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterStartResponse, unknown, ClusterStartRequest>({
    mutationFn: (request: ClusterStartRequest) =>
      runParallelAction(startCluster(request, context)),
    onSuccess: (_data, variables) => {
      if (variables && typeof variables === "object" && "dbName" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "cluster", "get", variables.dbName],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["sealos", "cluster", "list"],
      });
    },
  });
}

export function useStopClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterPauseResponse, unknown, ClusterPauseRequest>({
    mutationFn: (request: ClusterPauseRequest) =>
      runParallelAction(pauseCluster(request, context)),
    onSuccess: (_data, variables) => {
      if (variables && typeof variables === "object" && "dbName" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "cluster", "get", variables.dbName],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["sealos", "cluster", "list"],
      });
    },
  });
}

export function useDeleteClusterMutation(context: ClusterApiContext) {
  const queryClient = useQueryClient();
  return useMutation<ClusterDeleteResponse, unknown, ClusterDeleteRequest>({
    mutationFn: (request: ClusterDeleteRequest) =>
      runParallelAction(deleteCluster(request, context)),
    onSuccess: (_data, variables) => {
      if (variables && typeof variables === "object" && "name" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["sealos", "cluster", "get", variables.name],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["sealos", "cluster", "list"],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", "clusters"] });
    },
  });
}
