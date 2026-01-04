"use client";

import type { RunsInvokePayload } from "@langchain/langgraph-sdk";
import { ThreadState } from "@langchain/langgraph-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import type { SystemMessage } from "@/lib/copilot/message/message-utils";
import {
	type BuiltinResourceTarget,
	type CustomResourceTarget,
	ResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
	deleteThread,
	threadRunStream,
	updateThreadState,
} from "../langgraph-api/langgraph-api-service";

// ============================================================================
// MUTATION HOOKS
// ============================================================================

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
	const { auth } = useAuthState();
	const queryClient = useQueryClient();

	return {
		mutationFn: async ({
			threadId,
			values,
			asNode = "manage_resource_agent",
		}: {
			threadId: string;
			values: any;
			asNode?: string;
		}) => {
			console.log("Updating thread state:", { threadId, values, asNode });
			const result = await updateThreadState(
				threadId,
				values,
				asNode,
				auth?.kubeconfig,
			);
			return result;
		},
		onSuccess: (data: any, variables: any) => {
			// Invalidate and refetch thread-related queries
		},
		onError: (error: any) => {
			console.error("Failed to update thread state:", error);
		},
	};
};

/**
 * Hook for deleting a thread
 */
export const useDeleteThreadMutation = () => {
	const { auth } = useAuthState();
	const queryClient = useQueryClient();
	// Note: selectThread is now handled by ThreadProvider

	return useMutation({
		mutationFn: async (threadId: string) => {
			return await deleteThread(threadId, auth?.kubeconfig);
		},
		onSuccess: (data, variables) => {
			// Invalidate and refetch thread-related queries
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			queryClient.invalidateQueries({
				queryKey: ["langgraph", "threads", "search"],
			});

			// Thread selection management is now handled by ThreadProvider
		},
		onError: (error) => {
			console.error("Failed to delete thread:", error);
		},
	});
};

/**
 * Hook for creating a run in an existing thread
 */
export const useCreateThreadRunStreamMutation = () => {
	const { auth } = useAuthState();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			threadId,
			assistantId,
			payload,
		}: {
			threadId: string;
			assistantId: string;
			payload?: RunsInvokePayload;
		}) => {
			console.log("Creating run:", { threadId, assistantId, payload });
			const result = await threadRunStream(
				threadId,
				assistantId,
				payload,
				auth?.kubeconfig,
			);
			return result;
		},
		onSuccess: (data, variables) => {
			// Invalidate and refetch thread-related queries
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			queryClient.invalidateQueries({
				queryKey: ["langgraph", "threads", variables.threadId],
			});
			queryClient.invalidateQueries({
				queryKey: ["langgraph", "threads", "search"],
			});
		},
		onError: (error) => {
			console.error("Failed to create run:", error);
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
