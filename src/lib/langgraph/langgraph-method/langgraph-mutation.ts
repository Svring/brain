"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createThread,
  updateThreadState,
  deleteThread,
} from "../langgraph-api/langgraph-trpc-service";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { randomId } from "@copilotkit/shared";
import { SystemMessage } from "@/lib/copilot/message/message-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ThreadState } from "@langchain/langgraph-sdk";

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook for creating a new chat session with copilot context management
 */
export const useCreateNewChatSessionMutation = () => {
  const { auth } = useAuthState();
  const queryClient = useQueryClient();
  const { selectedResource, selectedProject } = useProjectState();
  const { baseUrl } = useLanggraphState();

  return useMutation({
    mutationFn: async () => {
      const supersteps = baseUrl
        ? [
            {
              updates: [
                {
                  values: {
                    base_url: baseUrl,
                  },
                  as_node: "entry_node",
                },
              ],
            },
          ]
        : undefined;

      return await createThread({
        kubeconfig: auth?.kubeconfig || "",
        projectName: selectedProject || undefined,
        resourceTarget: selectedResource || null,
        supersteps,
      });
    },
    onSuccess: (data, variables) => {
      // Thread selection is now handled by ThreadProvider
      // console.log("new thread created", data.thread_id);

      queryClient.refetchQueries({ queryKey: ["threads"] });
      // Invalidate searchThreadsOptions queries
      queryClient.refetchQueries({
        queryKey: ["langgraph", "threads", "search"],
      });
      // Invalidate getThreadStateOptions queries
      queryClient.refetchQueries({
        queryKey: ["langgraph", "thread", "state"],
      });
    },
    onError: (error) => {
      console.error("Failed to create chat session:", error);
    },
  });
};

/**
 * Hook for sending a single message to the chat and opening the sidebar
 * Note: This is now handled by the useStream hook in components
 */
export const useSendMessageMutation = () => {
  // Note: openSidebarChat is now handled by components directly

  return useMutation({
    mutationFn: async (message: {
      role: "user" | "assistant" | "system";
      content: string;
    }) => {
      // Sidebar chat opening is now handled by components directly
      return message;
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });
};
/**
 * Hook to send system messages with type and target parameters
 * @returns Object containing sendSystemMessage function
 */

export const useAppendSystemMessageMutation = () => {
  // Note: openSidebarChat is now handled by components directly

  return useMutation({
    mutationFn: async ({
      type,
      target,
      payload,
    }: {
      type: string;
      target: CustomResourceTarget | BuiltinResourceTarget;
      payload?: any;
    }) => {
      // Create system message data
      const systemMessageData: SystemMessage = {
        type,
        target,
        payload,
      };

      // Sidebar chat opening is now handled by components directly
      return systemMessageData;
    },
    onError: (error) => {
      console.error("Failed to append system message:", error);
    },
  });
};

/**
 * Hook for updating thread state
 */
export const useUpdateThreadStateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      state,
    }: {
      threadId: string;
      state: any;
    }) => {
      return await updateThreadState(threadId, state);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch thread-related queries
    },
    onError: (error) => {
      console.error("Failed to update thread state:", error);
    },
  });
};

/**
 * Hook for deleting a thread
 */
export const useDeleteThreadMutation = () => {
  const queryClient = useQueryClient();
  // Note: selectThread is now handled by ThreadProvider

  return useMutation({
    mutationFn: async (threadId: string) => {
      return await deleteThread(threadId);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch thread-related queries
      queryClient.invalidateQueries({ queryKey: ["threads"] });

      // Thread selection management is now handled by ThreadProvider
    },
    onError: (error) => {
      console.error("Failed to delete thread:", error);
    },
  });
};

// /**
//  * Hook for appending new messages of any role to the chat
//  */
// export const useAppendMessagesMutation = () => {
//   const { setMessages, messages } = useCopilotChatHeadless_c();
//   const { openSidebarChat } = useChatActions();

//   return useMutation({
//     mutationFn: async (
//       newMessages: Array<{
//         role: "user" | "assistant" | "system";
//         content: string | object;
//       }>
//     ) => {
//       // Create message objects with random IDs
//       const messageObjects = newMessages.map((message) => ({
//         id: randomId(),
//         role: message.role,
//         content:
//           message.role === "system"
//             ? JSON.stringify(message.content)
//             : String(message.content),
//       }));

//       // Append new messages to existing messages
//       const updatedMessages = [...messages, ...messageObjects];
//       setMessages(updatedMessages);

//       // Open the sidebar chat
//       openSidebarChat();

//       return messageObjects;
//     },
//     onError: (error) => {
//       console.error("Failed to append messages:", error);
//     },
//   });
// };
