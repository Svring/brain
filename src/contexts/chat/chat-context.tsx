"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import type { Thread } from "@langchain/langgraph-sdk";
import { chatMachine, type PendingMessage } from "@/contexts/chat/chat-machine";
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
  return {
    sidebarChatOpen: state.context.sidebarChat.open,
    floatingChatOpen: state.context.floatingChat.open,
    sidebarChatResponding: state.context.sidebarChat.responding,
    floatingChatResponding: state.context.floatingChat.responding,
    sidebarChatMaximized: state.context.sidebarChat.maximized,
    floatingChatMaximized: state.context.floatingChat.maximized,
    sidebarChatLoading: state.context.sidebarChat.loading,
    floatingChatLoading: state.context.floatingChat.loading,
    selectedThreadId: state.context.selectedThreadId,
    threads: state.context.threads,
    pendingMessage: state.context.pendingMessage,
    hasPendingMessage: state.context.pendingMessage !== null,
    scrollTrigger: state.context.scrollTrigger,
  };
}

export function useChatActions() {
  const { send, state } = useChatContext();
  const [threadId, setThreadId] = useQueryState("threadId", {
    defaultValue: state.context.selectedThreadId || "",
  });

  // Sync URL state with chat context
  useEffect(() => {
    if (threadId && threadId !== state.context.selectedThreadId) {
      send({ type: "SELECT_THREAD", threadId });
    }
  }, [threadId, state.context.selectedThreadId]);

  return {
    openSidebarChat: () => send({ type: "SET_SIDEBAR_CHAT_OPEN", open: true }),
    closeSidebarChat: () => {
      send({ type: "SET_SIDEBAR_CHAT_OPEN", open: false });
    },

    openFloatingChat: () =>
      send({ type: "SET_FLOATING_CHAT_OPEN", open: true }),
    closeFloatingChat: () =>
      send({ type: "SET_FLOATING_CHAT_OPEN", open: false }),

    setSidebarResponding: (responding: boolean) =>
      send({ type: "SET_SIDEBAR_RESPONDING", responding }),
    setFloatingResponding: (responding: boolean) =>
      send({ type: "SET_FLOATING_RESPONDING", responding }),

    enableSidebarResponding: () =>
      send({ type: "SET_SIDEBAR_RESPONDING", responding: true }),
    disableSidebarResponding: () =>
      send({ type: "SET_SIDEBAR_RESPONDING", responding: false }),
    enableFloatingResponding: () =>
      send({ type: "SET_FLOATING_RESPONDING", responding: true }),
    disableFloatingResponding: () =>
      send({ type: "SET_FLOATING_RESPONDING", responding: false }),

    setSidebarMaximized: (maximized: boolean) =>
      send({ type: "SET_SIDEBAR_MAXIMIZED", maximized }),
    setFloatingMaximized: (maximized: boolean) =>
      send({ type: "SET_FLOATING_MAXIMIZED", maximized }),

    maximizeSidebar: () =>
      send({ type: "SET_SIDEBAR_MAXIMIZED", maximized: true }),
    minimizeSidebar: () =>
      send({ type: "SET_SIDEBAR_MAXIMIZED", maximized: false }),
    maximizeFloating: () =>
      send({ type: "SET_FLOATING_MAXIMIZED", maximized: true }),
    minimizeFloating: () =>
      send({ type: "SET_FLOATING_MAXIMIZED", maximized: false }),

    setSidebarLoading: (loading: boolean) =>
      send({ type: "SET_SIDEBAR_LOADING", loading }),
    setFloatingLoading: (loading: boolean) =>
      send({ type: "SET_FLOATING_LOADING", loading }),

    enableSidebarLoading: () =>
      send({ type: "SET_SIDEBAR_LOADING", loading: true }),
    disableSidebarLoading: () =>
      send({ type: "SET_SIDEBAR_LOADING", loading: false }),
    enableFloatingLoading: () =>
      send({ type: "SET_FLOATING_LOADING", loading: true }),
    disableFloatingLoading: () =>
      send({ type: "SET_FLOATING_LOADING", loading: false }),

    selectThread: (threadId: string | null) => {
      send({ type: "SELECT_THREAD", threadId });
      setThreadId(threadId || "");
    },
    setThreads: (threads: Thread[]) => send({ type: "SET_THREADS", threads }),

    setPendingMessage: (message: PendingMessage | null) => {
      send({ type: "SET_PENDING_MESSAGE", message });
    },
    clearPendingMessage: () => {
      send({ type: "CLEAR_PENDING_MESSAGE" });
    },

    triggerScrollToBottom: () => {
      send({ type: "TRIGGER_SCROLL_TO_BOTTOM" });
    },
  };
}
