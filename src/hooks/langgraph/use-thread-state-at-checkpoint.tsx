"use client";

import { useQuery } from "@tanstack/react-query";
import { getThreadStateAtCheckpointOptions } from "@/lib/langgraph/langgraph-method/langgraph-query";

/**
 * Hook to get thread state at a specific checkpoint
 * 
 * @param threadId - The ID of the thread
 * @param checkpointId - The ID of the checkpoint
 * @param subgraphs - Whether to include subgraphs in the response
 * @returns Query result with thread state at checkpoint
 */
export const useThreadStateAtCheckpoint = (
  threadId: string,
  checkpointId: string,
  subgraphs?: boolean
) => {
  return useQuery(
    getThreadStateAtCheckpointOptions(threadId, checkpointId, subgraphs)
  );
};

export default useThreadStateAtCheckpoint;
