"use client";

import { assign, createMachine } from "xstate";

export interface AiConfig {
  base_url: string;
  api_key: string;
  model: string;
  system_prompt: string;
}

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
}

export interface AiChat {
  open: boolean;
}

export interface AiContext {
  config: AiConfig;
  state: AiState;
  chat: AiChat;
}

export type AiEvent =
  | { type: "CHAT_OPEN" }
  | { type: "CHAT_CLOSE" }
  | { type: "SET_CONFIG" }
  | { type: "SET_STATE" };

export const AiMachine = createMachine({
  types: {} as { context: AiContext; events: AiEvent },
  id: "ai",
  initial: "idle",
  context: {
    config: {
      base_url: "",
      api_key: "",
      model: "",
      system_prompt: "",
    },
    state: {
      base_url: "",
      api_key: "",
      model: "",
      system_prompt: "",
      project_context: {
        homepageData: {
          projects: [],
        },
        flowGraphData: {
          project: {},
          resources: [],
        },
      },
    },
    chat: {
      open: false,
    },
  },
  states: {
    initializing: {},
    active: {},
  },
});
