"use client";

import { assign, createMachine } from "xstate";
import { Thread } from "@langchain/langgraph-sdk";

export interface ChatSectionState {
  open: boolean;
  responding: boolean;
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
  | { type: "SELECT_THREAD"; threadId: string }
  | { type: "SET_THREADS"; threads: Thread[] };

export const chatMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: ChatContextState; events: ChatEvent },
  id: "chat",
  initial: "idle",
  context: {
    sidebarChat: { open: false, responding: false },
    floatingChat: { open: false, responding: false },
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
