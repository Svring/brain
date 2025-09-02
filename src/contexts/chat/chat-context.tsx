"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import type { Thread } from "@langchain/langgraph-sdk";
import { chatMachine } from "@/contexts/chat/chat-machine";
import { useProjectActions } from "../project/project-context";

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
  return {
    sidebarChatOpen: state.context.sidebarChat.open,
    floatingChatOpen: state.context.floatingChat.open,
    selectedThreadId: state.context.selectedThreadId,
    threads: state.context.threads,
  };
}

export function useChatActions() {
  const { send } = useChatContext();
  // const { clearSelectedResource } = useProjectActions();

  return {
    openSidebarChat: () => send({ type: "SET_SIDEBAR_CHAT_OPEN", open: true }),
    closeSidebarChat: () => {
      send({ type: "SET_SIDEBAR_CHAT_OPEN", open: false });
      // clearSelectedResource();
    },

    openFloatingChat: () =>
      send({ type: "SET_FLOATING_CHAT_OPEN", open: true }),
    closeFloatingChat: () =>
      send({ type: "SET_FLOATING_CHAT_OPEN", open: false }),

    selectThread: (threadId: string) =>
      send({ type: "SELECT_THREAD", threadId }),
    setThreads: (threads: Thread[]) =>
      send({ type: "SET_THREADS", threads }),
  };
}
