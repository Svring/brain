"use client";

import { assign, createMachine } from "xstate";

export interface OrchestratorContextState {
  monitoredStates: {
    sidebarChatOpen: boolean;
  };
}

export type OrchestratorEvent = {
  type: "UPDATE_SIDEBAR_CHAT_STATE";
  open: boolean;
};

export const orchestratorMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: OrchestratorContextState; events: OrchestratorEvent },
  id: "orchestrator",
  initial: "idle",
  context: {
    monitoredStates: {
      sidebarChatOpen: false,
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
  },
});
