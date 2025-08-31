"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  listThreads,
  getThread,
  searchThreads,
} from "../langgraph-api/langgraph-api";

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
    queryKey: ["langgraph", "threads", "search", metadata],
    queryFn: async () => await searchThreads(metadata),
  });
