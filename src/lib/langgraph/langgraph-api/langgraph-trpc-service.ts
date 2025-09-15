"use client";

import { langgraphClient } from "@/components/provider/trpc-provider";

// ============================================================================
// TRPC-BASED LANGGRAPH API SERVICE
// ============================================================================

/**
 * List all threads using tRPC
 */
export async function listThreads() {
  return await langgraphClient.list.query();
}

/**
 * Get a specific thread using tRPC
 */
export async function getThread(threadId: string) {
  return await langgraphClient.get.query(threadId);
}

/**
 * Search threads with metadata using tRPC
 */
export async function searchThreads(metadata: Record<string, any>) {
  return await langgraphClient.search.query(metadata);
}

/**
 * Create a new thread using tRPC
 */
export async function createThread({
  kubeconfig,
  projectName,
  resourceTarget,
  metadata,
  supersteps,
}: {
  kubeconfig: string;
  projectName?: string;
  resourceTarget?: any;
  metadata?: Record<string, any>;
  supersteps?: Array<{
    updates: Array<{
      values: Record<string, any>;
      as_node: string;
    }>;
  }>;
}) {
  return await langgraphClient.create.mutate({
    kubeconfig,
    projectName,
    resourceTarget,
    metadata,
    supersteps,
  });
}

/**
 * Update thread state using tRPC
 */
export async function updateThreadState(threadId: string, state: any) {
  return await langgraphClient.updateState.mutate({
    threadId,
    state,
  });
}

/**
 * Delete a thread using tRPC
 */
export async function deleteThread(threadId: string) {
  return await langgraphClient.delete.mutate(threadId);
}
