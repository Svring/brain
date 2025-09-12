"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createThread,
  updateThreadState,
} from "../langgraph-api/langgraph-api";
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
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ThreadState } from "@langchain/langgraph-sdk";

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook for creating a new chat session with copilot context management
 */
export const useCreateNewChatSessionMutation = (
  resourceTarget?: ResourceTarget
) => {
  const { auth } = useAuthState();
  const { selectedProject, selectedResource } = useProjectState();
  const updateThreadStateMutation = useUpdateThreadStateMutation();

  return useMutation({
    mutationFn: async () => {
      return await createThread({
        kubeconfig: auth?.kubeconfig || "",
        projectName: selectedProject || undefined,
        resourceTarget: resourceTarget || selectedResource || undefined,
      });
    },
    onSuccess: (newThread) => {
      // Update the thread state with initial "hi" message
      // updateThreadStateMutation.mutate({
      //   threadId: newThread.thread_id,
      //   state: {
      //     values: {
      //       messages: [
      //         {
      //           content: "hi",
      //           additional_kwargs: {
      //             type: "human",
      //           },
      //           response_metadata: {},
      //           type: "human",
      //           name: null,
      //           id: "ck-444cb6c6-522a-47c5-8064-395f083e836b",
      //           example: false,
      //         },
      //       ],
      //     },
      //   },
      // });
    },
    onError: (error) => {
      console.error("Failed to create chat session:", error);
    },
  });
};

/**
 * Hook for sending a single message to the chat and opening the sidebar
 */
export const useSendMessageMutation = () => {
  const { sendMessage } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();

  return useMutation({
    mutationFn: async (message: {
      role: "user" | "assistant" | "system";
      content: string;
    }) => {
      // Send the message using sendMessage
      sendMessage({
        id: randomId(),
        role: message.role,
        content: message.content,
      });

      // Open the sidebar chat
      openSidebarChat();

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
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();

  const appendSystemMessage = ({
    type,
    target,
    payload,
    onSuccess,
    resetMessages,
  }: {
    type: string;
    target: CustomResourceTarget | BuiltinResourceTarget;
    payload?: any;
    onSuccess?: () => void;
    resetMessages?: boolean;
  }) => {
    try {
      // Create system message data
      const systemMessageData: SystemMessage = {
        type,
        target,
        payload,
      };

      // Send a message about the resource in current session
      const newMessages = resetMessages
        ? [
            {
              id: randomId(),
              role: "system" as const,
              content: JSON.stringify(systemMessageData),
            },
          ]
        : [
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
    } catch (error) {
      console.error("Failed to append system message:", error);
    }
  };

  return { appendSystemMessage };
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
