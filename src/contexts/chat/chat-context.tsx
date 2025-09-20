"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import type { Thread } from "@langchain/langgraph-sdk";
import { chatMachine, type ChatSectionState, serializeResourceTarget } from "@/contexts/chat/chat-machine";
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
  
  return {
    // Multi-instance state
    chatInstances: state.context.chatInstances,
    activeResourceTargets: state.context.activeResourceTargets,
    focusedResourceTarget: state.context.focusedResourceTarget,
    
    // Helper functions
    isResourceActive,
    getChatInstance,
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

  };
}
