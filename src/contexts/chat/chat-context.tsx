"use client";

import type { Message, Thread } from "@langchain/langgraph-sdk";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { useQueryState } from "nuqs";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
} from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import {
	type ChatSectionState,
	chatMachine,
	getProjectChatKey,
	serializeResourceTarget,
	serializeTargetKey,
} from "@/contexts/chat/chat-machine";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useProjectActions, useProjectState } from "../project/project-context";

// const inspector = createBrowserInspector();

interface ChatContextValue {
	state: StateFrom<typeof chatMachine>;
	send: (event: EventFrom<typeof chatMachine>) => void;
	actorRef: ActorRefFrom<typeof chatMachine>;
}

export const ChatContext = createContext<ChatContextValue | undefined>(
	undefined,
);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
	const [state, send, actorRef] = useMachine(chatMachine, {
		// inspect: inspector.inspect,
	});

	return (
		<ChatContext.Provider value={{ state, send, actorRef }}>
			{children}
		</ChatContext.Provider>
	);
};

export function useChatContext() {
	const ctx = useContext(ChatContext);
	if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
	return ctx;
}

export function useChatState() {
	const { state } = useChatContext();

	// Helper to check if a resource target is active
	const isResourceActive = (resourceTarget: ResourceTarget) => {
		const key = serializeResourceTarget(resourceTarget);
		return state.context.activeResourceTargets.includes(key);
	};

	// Helper to get chat instance by resource target
	const getChatInstance = (resourceTarget: ResourceTarget) => {
		const key = serializeResourceTarget(resourceTarget);
		return state.context.chatInstances.get(key);
	};

	// Helper to get project chat instance
	const getProjectChatInstance = (projectName: string) => {
		const projectChatKey = getProjectChatKey(projectName);
		return state.context.chatInstances.get(projectChatKey);
	};

	// Helper to check if project chat is focused
	const isProjectChatFocused = (projectName: string) => {
		const projectChatKey = getProjectChatKey(projectName);
		return state.context.focusedResourceTarget === projectChatKey;
	};

	// Helper to get pending messages for a specific target
	const getPendingMessages = (resourceTarget: ResourceTarget | null) => {
		const key = serializeTargetKey(resourceTarget);
		return state.context.pendingMessages.get(key) || [];
	};

	// Helper to check if target has pending messages
	const hasPendingMessages = (resourceTarget: ResourceTarget | null) => {
		const key = serializeTargetKey(resourceTarget);
		const messages = state.context.pendingMessages.get(key);
		return messages && messages.length > 0;
	};

	// Helper to check if trigger is set for pending messages
	const shouldTriggerPendingMessages = (
		resourceTarget: ResourceTarget | null,
	) => {
		const key = serializeTargetKey(resourceTarget);
		return state.context.triggerPendingMessages.get(key) || false;
	};

	// Helper to get the maximized state of the focused chat
	const getSidebarChatMaximized = () => {
		const focusedTarget = state.context.focusedResourceTarget;
		if (!focusedTarget) return false;

		const instance = state.context.chatInstances.get(focusedTarget);
		return instance?.state?.maximized || false;
	};

	return {
		// Multi-instance state
		chatInstances: state.context.chatInstances,
		activeResourceTargets: state.context.activeResourceTargets,
		focusedResourceTarget: state.context.focusedResourceTarget,
		pendingMessages: state.context.pendingMessages,
		chatDisplayOrder: state.context.chatDisplayOrder,
		triggerPendingMessages: state.context.triggerPendingMessages,

		// Computed properties
		sidebarChatMaximized: getSidebarChatMaximized(),

		// Helper functions
		isResourceActive,
		getChatInstance,
		getProjectChatInstance,
		isProjectChatFocused,
		getPendingMessages,
		hasPendingMessages,
		shouldTriggerPendingMessages,
	};
}

export function useChatActions() {
	const { send, state } = useChatContext();
	const { clearSelectedResource } = useProjectActions();
	const { selectedResource } = useProjectState();

	const openChat = useCallback(
		(resourceTarget: ResourceTarget) =>
			send({ type: "OPEN_CHAT", resourceTarget }),
		[send],
	);

	const closeChat = useCallback(
		(resourceTarget: ResourceTarget) => {
			// Clear selectedResource when closing a resource chat
			send({ type: "CLOSE_CHAT", resourceTarget });
			// Only clear selectedResource if this is the currently selected resource
			if (
				selectedResource &&
				JSON.stringify(selectedResource) === JSON.stringify(resourceTarget)
			) {
				clearSelectedResource();
			}
		},
		[send, selectedResource, clearSelectedResource],
	);

	const setChatThreadId = useCallback(
		(resourceTarget: ResourceTarget, threadId: string | null) =>
			send({ type: "SET_CHAT_THREAD_ID", resourceTarget, threadId }),
		[send],
	);

	const setChatThreads = useCallback(
		(resourceTarget: ResourceTarget, threads: Thread[]) =>
			send({ type: "SET_CHAT_THREADS", resourceTarget, threads }),
		[send],
	);

	const setChatState = useCallback(
		(resourceTarget: ResourceTarget, chatState: Partial<ChatSectionState>) =>
			send({ type: "SET_CHAT_STATE", resourceTarget, state: chatState }),
		[send],
	);

	const openProjectChat = useCallback(
		(projectName: string) => send({ type: "OPEN_PROJECT_CHAT", projectName }),
		[send],
	);

	const closeProjectChat = useCallback(
		(projectName: string) => {
			// Clear selectedResource when closing a project chat
			send({ type: "CLOSE_PROJECT_CHAT", projectName });
			// Clear selectedResource when closing a project chat (always clear since project chat doesn't select a resource)
			clearSelectedResource();
		},
		[send, clearSelectedResource],
	);

	const setProjectChatThreadId = useCallback(
		(projectName: string, threadId: string | null) =>
			send({ type: "SET_PROJECT_CHAT_THREAD_ID", projectName, threadId }),
		[send],
	);

	const setProjectChatThreads = useCallback(
		(projectName: string, threads: Thread[]) =>
			send({ type: "SET_PROJECT_CHAT_THREADS", projectName, threads }),
		[send],
	);

	const setProjectChatState = useCallback(
		(projectName: string, chatState: Partial<ChatSectionState>) =>
			send({ type: "SET_PROJECT_CHAT_STATE", projectName, state: chatState }),
		[send],
	);

	const addPendingMessage = useCallback(
		(resourceTarget: ResourceTarget | null, message: Message) =>
			send({ type: "ADD_PENDING_MESSAGE", resourceTarget, message }),
		[send],
	);

	const removePendingMessage = useCallback(
		(resourceTarget: ResourceTarget | null, messageIndex: number) =>
			send({ type: "REMOVE_PENDING_MESSAGE", resourceTarget, messageIndex }),
		[send],
	);

	const clearPendingMessages = useCallback(
		(resourceTarget: ResourceTarget | null) =>
			send({ type: "CLEAR_PENDING_MESSAGES", resourceTarget }),
		[send],
	);

	const triggerPendingMessages = useCallback(
		(resourceTarget: ResourceTarget | null) =>
			send({ type: "TRIGGER_PENDING_MESSAGES", resourceTarget }),
		[send],
	);

	const clearTriggerPendingMessages = useCallback(
		(resourceTarget: ResourceTarget | null) =>
			send({ type: "CLEAR_TRIGGER_PENDING_MESSAGES", resourceTarget }),
		[send],
	);

	return {
		// Multi-instance chat management
		openChat,
		closeChat,

		// Per-instance state management
		setChatThreadId,
		setChatThreads,
		setChatState,

		// Project chat management
		openProjectChat,
		closeProjectChat,

		// Project chat state management
		setProjectChatThreadId,
		setProjectChatThreads,
		setProjectChatState,

		// Pending message management
		addPendingMessage,
		removePendingMessage,
		clearPendingMessages,

		// Trigger pending message submission
		triggerPendingMessages,
		clearTriggerPendingMessages,
	};
}
