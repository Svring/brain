"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread } from "../langgraph-api/langgraph-api";
import { useCopilotContext } from "@copilotkit/react-core";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useChatActions } from "@/contexts/chat/chat-context";
import { randomId } from "@copilotkit/shared";
import { SystemMessageData } from "@/lib/copilot/message/message-utils";

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
 * Hook to get the emitSystemMessage function with current context
 * @returns Object containing emitSystemMessage function
 */

export const useSendSystemMessageMutation = () => {
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();

  const sendSystemMessage = (
    systemMessageData: SystemMessageData,
    assistantContent?: string
  ) => {
    emitSystemMessage(
      setMessages,
      messages,
      openSidebarChat,
      systemMessageData,
      assistantContent
    );
  };

  return { sendSystemMessage };
};
/**
 * Utility function to emit a system message and open the sidebar chat
 * @param setMessages - Function to set messages from useCopilotChatHeadless_c
 * @param messages - Current messages array from useCopilotChatHeadless_c
 * @param openSidebarChat - Function to open sidebar chat from useChatActions
 * @param assistantContent - Content for the assistant message
 * @param systemMessageData - Data for the system message (type and payload)
 */

export const emitSystemMessage = (
  setMessages: ReturnType<typeof useCopilotChatHeadless_c>["setMessages"],
  messages: ReturnType<typeof useCopilotChatHeadless_c>["messages"],
  openSidebarChat: ReturnType<typeof useChatActions>["openSidebarChat"],
  systemMessageData: SystemMessageData,
  assistantContent?: string
) => {
  // Send a message about the resource
  const newMessages = [
    ...messages,
    {
      id: randomId(),
      role: "system" as const,
      content: JSON.stringify(systemMessageData),
    },
  ];

  // Only add assistant message if content is provided
  if (assistantContent) {
    newMessages.splice(-1, 0, {
      id: randomId(),
      role: "assistant" as const,
      content: assistantContent,
    });
  }

  setMessages(newMessages);

  // Open the sidebar chat
  openSidebarChat();
};
