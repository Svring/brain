"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread } from "../langgraph-api/langgraph-api";
import { useCopilotContext } from "@copilotkit/react-core";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { randomId } from "@copilotkit/shared";
import { SystemMessage } from "@/lib/copilot/message/message-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook for creating a new chat session with copilot context management
 */
export const useCreateNewChatSessionMutation = () => {
  const queryClient = useQueryClient();
  const { selectThread } = useChatActions();
  const { reset } = useCopilotChatHeadless_c();

  return useMutation({
    mutationFn: async ({
      kubeconfig,
      projectName,
      resourceName,
    }: {
      kubeconfig: string;
      projectName?: string;
      resourceName?: string;
    }) => {
      return await createThread({ kubeconfig, projectName, resourceName });
    },
    onSuccess: (thread) => {
      // Set the new thread ID in chat context
      selectThread(thread.thread_id);
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

/**
 * Hook for sending messages to the chat and opening the sidebar
 */
export const useSendMessageMutation = () => {
  const { sendMessage } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();

  return useMutation({
    mutationFn: async (
      newMessages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
      }>
    ) => {
      // Send each message individually using sendMessage
      for (const message of newMessages) {
        sendMessage({
          id: randomId(),
          role: message.role,
          content: message.content,
        });
      }

      // Open the sidebar chat
      openSidebarChat();

      return newMessages;
    },
    onError: (error) => {
      console.error("Failed to send messages:", error);
    },
  });
};
/**
 * Hook to send system messages with type and target parameters
 * @returns Object containing sendSystemMessage function
 */

export const useAppendSystemMessageMutation = () => {
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();
  const { mutate: createNewChatSession } = useCreateNewChatSessionMutation();
  const { auth } = useAuthState();
  const { selectedProject } = useProjectState();

  const appendSystemMessage = (
    type: string,
    target: CustomResourceTarget | BuiltinResourceTarget,
    shouldCreateChatSession?: boolean,
    payload?: any,
    onSuccess?: () => void
  ) => {
    // Create system message data
    const systemMessageData: SystemMessage = {
      type,
      target,
      payload,
    };

    // Handle chat session creation if needed
    if (shouldCreateChatSession && auth && selectedProject) {
      createNewChatSession(
        {
          kubeconfig: auth.kubeconfig,
          projectName: selectedProject,
          resourceName: target.name,
        },
        {
          onSuccess: () => {
            // Send a message about the resource in new session
            const newMessages = [
              {
                id: randomId(),
                role: "system" as const,
                content: JSON.stringify(systemMessageData),
              },
            ];

            setMessages(newMessages);
            openSidebarChat();

            // Execute the onSuccess callback if provided
            onSuccess?.();
          },
        }
      );
    } else {
      // Send a message about the resource in current session
      const newMessages = [
        ...messages,
        {
          id: randomId(),
          role: "system" as const,
          content: JSON.stringify(systemMessageData),
        },
      ];

      setMessages(newMessages);
      openSidebarChat();

      // Execute the onSuccess callback if provided
      onSuccess?.();
    }
  };

  return { appendSystemMessage };
};

/**
 * Hook for appending new messages of any role to the chat
 */
export const useAppendMessagesMutation = () => {
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();

  return useMutation({
    mutationFn: async (
      newMessages: Array<{
        role: "user" | "assistant" | "system";
        content: string | object;
      }>
    ) => {
      // Create message objects with random IDs
      const messageObjects = newMessages.map((message) => ({
        id: randomId(),
        role: message.role,
        content:
          message.role === "system"
            ? JSON.stringify(message.content)
            : String(message.content),
      }));

      // Append new messages to existing messages
      const updatedMessages = [...messages, ...messageObjects];
      setMessages(updatedMessages);

      // Open the sidebar chat
      openSidebarChat();

      return messageObjects;
    },
    onError: (error) => {
      console.error("Failed to append messages:", error);
    },
  });
};
