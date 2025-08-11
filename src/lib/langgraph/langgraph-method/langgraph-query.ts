"use client";

import { queryOptions } from "@tanstack/react-query";
import { listThreads, getThread } from "../langgraph-api/langgraph-api";

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
