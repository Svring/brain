"use client";

import { assign, createMachine } from "xstate";
import { Thread } from "@langchain/langgraph-sdk";

export interface ChatSectionState {
  open: boolean;
  responding: boolean;
  maximized: boolean;
  loading: boolean;
}

export interface ChatContextState {
  sidebarChat: ChatSectionState;
  floatingChat: ChatSectionState;
  selectedThreadId: string;
  threads: Thread[];
}

export type ChatEvent =
  | { type: "SET_SIDEBAR_CHAT_OPEN"; open: boolean }
  | { type: "SET_FLOATING_CHAT_OPEN"; open: boolean }
  | { type: "SET_SIDEBAR_RESPONDING"; responding: boolean }
  | { type: "SET_FLOATING_RESPONDING"; responding: boolean }
  | { type: "SET_SIDEBAR_MAXIMIZED"; maximized: boolean }
  | { type: "SET_FLOATING_MAXIMIZED"; maximized: boolean }
  | { type: "SET_SIDEBAR_LOADING"; loading: boolean }
  | { type: "SET_FLOATING_LOADING"; loading: boolean }
  | { type: "SELECT_THREAD"; threadId: string }
  | { type: "SET_THREADS"; threads: Thread[] };

export const chatMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: ChatContextState; events: ChatEvent },
  id: "chat",
  initial: "idle",
  context: {
    sidebarChat: {
      open: false,
      responding: false,
      maximized: false,
      loading: false,
    },
    floatingChat: {
      open: false,
      responding: false,
      maximized: false,
      loading: false,
    },
    selectedThreadId: "",
    threads: [],
  },
  states: {
    idle: {},
  },
  on: {
    SET_SIDEBAR_CHAT_OPEN: {
      actions: assign({
        sidebarChat: ({ context, event }) => ({
          ...context.sidebarChat,
          open: event.open,
          // Reset maximized state when chat is closed
          maximized: event.open ? context.sidebarChat.maximized : false,
        }),
      }),
    },
    SET_FLOATING_CHAT_OPEN: {
      actions: assign({
        floatingChat: ({ context, event }) => ({
          ...context.floatingChat,
          open: event.open,
        }),
      }),
    },
    SET_SIDEBAR_RESPONDING: {
      actions: assign({
        sidebarChat: ({ context, event }) => ({
          ...context.sidebarChat,
          responding: event.responding,
        }),
      }),
    },
    SET_FLOATING_RESPONDING: {
      actions: assign({
        floatingChat: ({ context, event }) => ({
          ...context.floatingChat,
          responding: event.responding,
        }),
      }),
    },
    SET_SIDEBAR_MAXIMIZED: {
      actions: assign({
        sidebarChat: ({ context, event }) => ({
          ...context.sidebarChat,
          maximized: event.maximized,
        }),
      }),
    },
    SET_FLOATING_MAXIMIZED: {
      actions: assign({
        floatingChat: ({ context, event }) => ({
          ...context.floatingChat,
          maximized: event.maximized,
        }),
      }),
    },
    SET_SIDEBAR_LOADING: {
      actions: assign({
        sidebarChat: ({ context, event }) => ({
          ...context.sidebarChat,
          loading: event.loading,
        }),
      }),
    },
    SET_FLOATING_LOADING: {
      actions: assign({
        floatingChat: ({ context, event }) => ({
          ...context.floatingChat,
          loading: event.loading,
        }),
      }),
    },
    SELECT_THREAD: {
      actions: assign({
        selectedThreadId: ({ event }) => event.threadId,
      }),
    },
    SET_THREADS: {
      actions: assign({
        threads: ({ event }) => event.threads,
      }),
    },
  },
});
