"use client";

import { assign, createMachine } from "xstate";

export interface OrchestratorContextState {
  monitoredStates: {
    sidebarChatOpen: boolean;
    sidebarChatMaximized: boolean;
  };
}

export type OrchestratorEvent =
  | {
      type: "UPDATE_SIDEBAR_CHAT_STATE";
      open: boolean;
    }
  | {
      type: "UPDATE_SIDEBAR_CHAT_MAXIMIZED";
      maximized: boolean;
    };

export const orchestratorMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: OrchestratorContextState; events: OrchestratorEvent },
  id: "orchestrator",
  initial: "idle",
  context: {
    monitoredStates: {
      sidebarChatOpen: false,
      sidebarChatMaximized: false,
    },
  },
  states: {
    idle: {},
  },
  on: {
    UPDATE_SIDEBAR_CHAT_STATE: {
      actions: assign({
        monitoredStates: ({ context, event }) => ({
          ...context.monitoredStates,
          sidebarChatOpen: event.open,
        }),
      }),
    },
    UPDATE_SIDEBAR_CHAT_MAXIMIZED: {
      actions: assign({
        monitoredStates: ({ context, event }) => ({
          ...context.monitoredStates,
          sidebarChatMaximized: event.maximized,
        }),
      }),
    },
  },
});
