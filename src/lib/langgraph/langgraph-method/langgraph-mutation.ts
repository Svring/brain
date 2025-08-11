"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread } from "../langgraph-api/langgraph-api";

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook for creating a new thread
 */
export const useCreateThreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await createThread();
    },
    onSuccess: () => {
      // Invalidate and refetch threads list after creating a new thread
      queryClient.invalidateQueries({
        queryKey: ["langgraph", "threads", "list"],
      });
    },
  });
};
