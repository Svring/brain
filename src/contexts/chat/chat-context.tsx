"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import type { Thread, Message } from "@langchain/langgraph-sdk";
import {
  chatMachine,
  type ChatSectionState,
  serializeResourceTarget,
  getProjectChatKey,
  serializeTargetKey,
} from "@/contexts/chat/chat-machine";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectActions, useProjectState } from "../project/project-context";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useQueryState } from "nuqs";


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

  const isResourceActive = (resourceTarget: ResourceTarget) => {
    const key = serializeResourceTarget(resourceTarget);
    return state.context.activeResourceTargets.includes(key);
  };

  const getChatInstance = (resourceTarget: ResourceTarget) => {
    const key = serializeResourceTarget(resourceTarget);
    return state.context.chatInstances.get(key);
  };

  const getProjectChatInstance = (projectName: string) => {
    const projectChatKey = getProjectChatKey(projectName);
    return state.context.chatInstances.get(projectChatKey);
  };

  const isProjectChatFocused = (projectName: string) => {
    const projectChatKey = getProjectChatKey(projectName);
    return state.context.focusedResourceTarget === projectChatKey;
  };

  const getPendingMessages = (resourceTarget: ResourceTarget | null) => {
    const key = serializeTargetKey(resourceTarget);
    return state.context.pendingMessages.get(key) || [];
  };

  const hasPendingMessages = (resourceTarget: ResourceTarget | null) => {
    const key = serializeTargetKey(resourceTarget);
    const messages = state.context.pendingMessages.get(key);
    return messages && messages.length > 0;
  };

  const shouldTriggerPendingMessages = (resourceTarget: ResourceTarget | null) => {
    const key = serializeTargetKey(resourceTarget);
    return state.context.triggerPendingMessages.get(key) || false;
  };

  const getSidebarChatMaximized = () => {
    const focusedTarget = state.context.focusedResourceTarget;
    if (!focusedTarget) return false;
    
    const instance = state.context.chatInstances.get(focusedTarget);
    return instance?.state?.maximized || false;
  };

  const getStackedChats = () => {
    return state.context.stackedChats;
  };

  const getActiveChatIndex = () => {
    return state.context.activeChatIndex;
  };

  const getActiveChatKey = () => {
    return state.context.stackedChats[state.context.activeChatIndex] || null;
  };

  const getChatZIndex = (chatKey: string) => {
    const instance = state.context.chatInstances.get(chatKey);
    return instance?.state?.zIndex || 10;
  };

  const isStackedChat = (chatKey: string) => {
    return state.context.stackedChats.includes(chatKey);
  };

  const getStackedChatInstances = () => {
    return state.context.stackedChats
      .map(chatKey => ({
        key: chatKey,
        instance: state.context.chatInstances.get(chatKey),
      }))
      .filter(item => item.instance);
  };

  const hasMultipleStackedChats = () => {
    return state.context.stackedChats.length > 1;
  };

  return {
    chatInstances: state.context.chatInstances,
    activeResourceTargets: state.context.activeResourceTargets,
    focusedResourceTarget: state.context.focusedResourceTarget,
    pendingMessages: state.context.pendingMessages,
    chatDisplayOrder: state.context.chatDisplayOrder,
    triggerPendingMessages: state.context.triggerPendingMessages,

    stackedChats: state.context.stackedChats,
    activeChatIndex: state.context.activeChatIndex,
    topLayerType: state.context.topLayerType,

    sidebarChatMaximized: getSidebarChatMaximized(),

    isResourceActive,
    getChatInstance,
    getProjectChatInstance,
    isProjectChatFocused,
    getPendingMessages,
    hasPendingMessages,
    shouldTriggerPendingMessages,

    getStackedChats,
    getActiveChatIndex,
    getActiveChatKey,
    getChatZIndex,
    isStackedChat,
    getStackedChatInstances,
    hasMultipleStackedChats,
  };
}

export function useChatActions() {
  const { send, state } = useChatContext();
  const { clearSelectedResource } = useProjectActions();
  const { selectedResource } = useProjectState();

  return {
    openChat: (resourceTarget: ResourceTarget) =>
      send({ type: "OPEN_CHAT", resourceTarget }),
    closeChat: (resourceTarget: ResourceTarget) => {
      send({ type: "CLOSE_CHAT", resourceTarget });
      if (
        selectedResource &&
        JSON.stringify(selectedResource) === JSON.stringify(resourceTarget)
      ) {
        clearSelectedResource();
      }
    },

    setChatThreadId: (
      resourceTarget: ResourceTarget,
      threadId: string | null
    ) => send({ type: "SET_CHAT_THREAD_ID", resourceTarget, threadId }),
    setChatThreads: (resourceTarget: ResourceTarget, threads: Thread[]) =>
      send({ type: "SET_CHAT_THREADS", resourceTarget, threads }),
    setChatState: (
      resourceTarget: ResourceTarget,
      chatState: Partial<ChatSectionState>
    ) => send({ type: "SET_CHAT_STATE", resourceTarget, state: chatState }),

    openProjectChat: (projectName: string) =>
      send({ type: "OPEN_PROJECT_CHAT", projectName }),
    closeProjectChat: (projectName: string) => {
      send({ type: "CLOSE_PROJECT_CHAT", projectName });
      clearSelectedResource();
    },

    setProjectChatThreadId: (projectName: string, threadId: string | null) =>
      send({ type: "SET_PROJECT_CHAT_THREAD_ID", projectName, threadId }),
    setProjectChatThreads: (projectName: string, threads: Thread[]) =>
      send({ type: "SET_PROJECT_CHAT_THREADS", projectName, threads }),
    setProjectChatState: (
      projectName: string,
      chatState: Partial<ChatSectionState>
    ) =>
      send({ type: "SET_PROJECT_CHAT_STATE", projectName, state: chatState }),

    focusChat: (chatKey: string) => send({ type: "FOCUS_CHAT", chatKey }),
    switchToNextChat: () => send({ type: "SWITCH_TO_NEXT_CHAT" }),
    switchToPrevChat: () => send({ type: "SWITCH_TO_PREV_CHAT" }),

    addPendingMessage: (
      resourceTarget: ResourceTarget | null,
      message: Message
    ) => send({ type: "ADD_PENDING_MESSAGE", resourceTarget, message }),
    removePendingMessage: (
      resourceTarget: ResourceTarget | null,
      messageIndex: number
    ) => send({ type: "REMOVE_PENDING_MESSAGE", resourceTarget, messageIndex }),
    clearPendingMessages: (resourceTarget: ResourceTarget | null) =>
      send({ type: "CLEAR_PENDING_MESSAGES", resourceTarget }),

    triggerPendingMessages: (resourceTarget: ResourceTarget | null) =>
      send({ type: "TRIGGER_PENDING_MESSAGES", resourceTarget }),
    clearTriggerPendingMessages: (resourceTarget: ResourceTarget | null) =>
      send({ type: "CLEAR_TRIGGER_PENDING_MESSAGES", resourceTarget }),

    setTopLayerType: (layerType: 'resource' | 'project') =>
      send({ type: "SET_TOP_LAYER_TYPE", layerType }),
  };
}