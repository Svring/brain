"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  listThreads,
  getThread,
  searchThreads,
} from "../langgraph-api/langgraph-trpc-service";
import {
  getThreadState,
  getThreadStateAtCheckpoint,
} from "../langgraph-api/langgraph-api-service";

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for listing threads
 */
export const listThreadsOptions = () =>
  queryOptions({
    queryKey: ["langgraph", "threads", "list"],
    queryFn: async () => await listThreads(),
  });

/**
 * Query options for getting a specific thread
 */
export const getThreadOptions = (threadId: string) =>
  queryOptions({
    queryKey: ["langgraph", "thread", threadId],
    queryFn: async () => await getThread(threadId),
    enabled: !!threadId,
  });

/**
 * Query options for searching threads
 */
export const searchThreadsOptions = (metadata: Record<string, any>) =>
  queryOptions({
    queryKey: ["threads", metadata],
    queryFn: async () => await searchThreads(metadata),
  });

/**
 * Query options for getting thread state
 */
export const getThreadStateOptions = (threadId: string) =>
  queryOptions({
    queryKey: ["langgraph", "thread", threadId, "state"],
    queryFn: async () => await getThreadState(threadId),
    enabled: !!threadId,
  });

/**
 * Query options for getting thread state at a specific checkpoint
 */
export const getThreadStateAtCheckpointOptions = (
  threadId: string,
  checkpointId: string,
  subgraphs?: boolean
) =>
  queryOptions({
    queryKey: [
      "langgraph",
      "thread",
      threadId,
      "state",
      "checkpoint",
      checkpointId,
      subgraphs,
    ],
    queryFn: async () =>
      await getThreadStateAtCheckpoint(threadId, checkpointId, subgraphs),
    enabled: !!threadId && !!checkpointId,
  });
