"use client";

import { assign, createMachine } from "xstate";

export interface AiState {
  base_url: string;
  api_key: string;
  model: string;
  system_prompt: string;
  project_context: {
    homepageData: {
      projects: any;
    };
    flowGraphData: {
      project: any;
      resources: any;
    };
  };
  flow_context: {
    nodes: any;
    edges: any;
    selectedNode: any;
    selectedEdge: any;
    isInitialized: boolean;
  };
}

export interface AiChat {
  open: boolean;
}

export interface AiContext {
  state: AiState;
  chat: AiChat;
  error: string | null;
}

export type AiEvent =
  | { type: "CHAT_OPEN" }
  | { type: "CHAT_CLOSE" }
  | { type: "SET_STATE"; state: Partial<AiState> }
  | { type: "SET_FLOW_CONTEXT"; flowContext: Partial<AiState["flow_context"]> }
  | { type: "CREDENTIALS_LOADED" }
  | { type: "FAIL"; error: string };

export const aiMachine = createMachine({
  types: {} as { context: AiContext; events: AiEvent },
  id: "ai",
  initial: "initializing",
  context: {
    state: {
      base_url: "",
      api_key: "",
      model: "gpt-4.1-nano",
      system_prompt:
        "you are sealos brain. Respond in plain text only. Never use markdown formatting, syntax, or demonstrations. Never explain markdown concepts, syntax, or provide markdown examples. Always respond in plain text regardless of the request.",
      project_context: {
        homepageData: {
          projects: [],
        },
        flowGraphData: {
          project: null,
          resources: null,
        },
      },
      flow_context: {
        nodes: [],
        edges: [],
        selectedNode: null,
        selectedEdge: null,
        isInitialized: false,
      },
    },
    chat: {
      open: false,
    },
    error: null,
  },
  states: {
    initializing: {
      on: {
        SET_STATE: {
          actions: assign({
            state: ({ context, event }) => ({
              ...context.state,
              ...event.state,
            }),
          }),
        },
        SET_FLOW_CONTEXT: {
          actions: assign({
            state: ({ context, event }) => ({
              ...context.state,
              flow_context: {
                ...context.state.flow_context,
                ...event.flowContext,
              },
            }),
          }),
        },
        CREDENTIALS_LOADED: {
          target: "active",
        },
        FAIL: {
          target: "error",
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },
    active: {
      on: {
        CHAT_OPEN: {
          actions: assign({
            chat: ({ context }) => ({
              ...context.chat,
              open: true,
            }),
          }),
        },
        CHAT_CLOSE: {
          actions: assign({
            chat: ({ context }) => ({
              ...context.chat,
              open: false,
            }),
          }),
        },
        SET_STATE: {
          actions: assign({
            state: ({ context, event }) => ({
              ...context.state,
              ...event.state,
            }),
          }),
        },
        SET_FLOW_CONTEXT: {
          actions: assign({
            state: ({ context, event }) => ({
              ...context.state,
              flow_context: {
                ...context.state.flow_context,
                ...event.flowContext,
              },
            }),
          }),
        },
        CREDENTIALS_LOADED: {
          // Allow credential updates in active state
        },
        FAIL: {
          target: "error",
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },
    error: {
      on: {
        SET_STATE: {
          actions: assign({
            state: ({ context, event }) => ({
              ...context.state,
              ...event.state,
            }),
          }),
        },
        SET_FLOW_CONTEXT: {
          actions: assign({
            state: ({ context, event }) => ({
              ...context.state,
              flow_context: {
                ...context.state.flow_context,
                ...event.flowContext,
              },
            }),
          }),
        },
        CREDENTIALS_LOADED: {
          target: "active",
          actions: assign({
            error: () => null,
          }),
        },
      },
    },
  },
});
