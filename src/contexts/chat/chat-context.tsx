"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import type { Thread, Message } from "@langchain/langgraph-sdk";
import { chatMachine, type ChatSectionState, serializeResourceTarget, getProjectChatKey, serializeTargetKey } from "@/contexts/chat/chat-machine";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectActions } from "../project/project-context";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useQueryState } from "nuqs";

// const inspector = createBrowserInspector();

interface ChatContextValue {
  state: StateFrom<typeof chatMachine>;
  send: (event: EventFrom<typeof chatMachine>) => void;
  actorRef: ActorRefFrom<typeof chatMachine>;
}

export const ChatContext = createContext<ChatContextValue | undefined>(
  undefined
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
  
  return {
    // Multi-instance state
    chatInstances: state.context.chatInstances,
    activeResourceTargets: state.context.activeResourceTargets,
    focusedResourceTarget: state.context.focusedResourceTarget,
    pendingMessages: state.context.pendingMessages,
    chatDisplayOrder: state.context.chatDisplayOrder,
    
    // Helper functions
    isResourceActive,
    getChatInstance,
    getProjectChatInstance,
    isProjectChatFocused,
    getPendingMessages,
    hasPendingMessages,
  };
}

export function useChatActions() {
  const { send, state } = useChatContext();

  return {
    // Multi-instance chat management
    openChat: (resourceTarget: ResourceTarget) =>
      send({ type: "OPEN_CHAT", resourceTarget }),
    closeChat: (resourceTarget: ResourceTarget) =>
      send({ type: "CLOSE_CHAT", resourceTarget }),

    // Per-instance state management
    setChatThreadId: (resourceTarget: ResourceTarget, threadId: string | null) =>
      send({ type: "SET_CHAT_THREAD_ID", resourceTarget, threadId }),
    setChatThreads: (resourceTarget: ResourceTarget, threads: Thread[]) =>
      send({ type: "SET_CHAT_THREADS", resourceTarget, threads }),
    setChatState: (resourceTarget: ResourceTarget, chatState: Partial<ChatSectionState>) =>
      send({ type: "SET_CHAT_STATE", resourceTarget, state: chatState }),

    // Project chat management
    openProjectChat: (projectName: string) => send({ type: "OPEN_PROJECT_CHAT", projectName }),
    closeProjectChat: (projectName: string) => send({ type: "CLOSE_PROJECT_CHAT", projectName }),
    
    // Project chat state management
    setProjectChatThreadId: (projectName: string, threadId: string | null) =>
      send({ type: "SET_PROJECT_CHAT_THREAD_ID", projectName, threadId }),
    setProjectChatThreads: (projectName: string, threads: Thread[]) =>
      send({ type: "SET_PROJECT_CHAT_THREADS", projectName, threads }),
    setProjectChatState: (projectName: string, chatState: Partial<ChatSectionState>) =>
      send({ type: "SET_PROJECT_CHAT_STATE", projectName, state: chatState }),

    // Pending message management
    addPendingMessage: (resourceTarget: ResourceTarget | null, message: Message) =>
      send({ type: "ADD_PENDING_MESSAGE", resourceTarget, message }),
    removePendingMessage: (resourceTarget: ResourceTarget | null, messageIndex: number) =>
      send({ type: "REMOVE_PENDING_MESSAGE", resourceTarget, messageIndex }),
    clearPendingMessages: (resourceTarget: ResourceTarget | null) =>
      send({ type: "CLEAR_PENDING_MESSAGES", resourceTarget }),
  };
}
