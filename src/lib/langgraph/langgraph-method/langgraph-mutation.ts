"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread } from "../langgraph-api/langgraph-api";
import { useCopilotContext } from "@copilotkit/react-core";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

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

/**
 * Hook for creating a new chat session with copilot context management
 */
export const useCreateNewChatSessionMutation = () => {
  const queryClient = useQueryClient();
  const { setThreadId } = useCopilotContext();
  const { reset } = useCopilotChatHeadless_c();

  return useMutation({
    mutationFn: async () => {
      return await createThread();
    },
    onSuccess: (thread) => {
      // Set the new thread ID in copilot context
      setThreadId(thread.thread_id);
      // Reset the chat headless state
      reset();
      // Invalidate and refetch threads list after creating a new thread
      queryClient.invalidateQueries({
        queryKey: ["langgraph", "threads", "list"],
      });
    },
    onError: (error) => {
      console.error("Failed to create chat session:", error);
    },
  });
};
