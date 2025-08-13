import { assign, createMachine } from "xstate";
import type {
  LanggraphAgentAiState,
  LanggraphAgentNewProjectState,
  LanggraphEvent,
} from "./langgraph-schema";

export const langgraphMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: LanggraphAgentAiState; events: LanggraphEvent },
  id: "langgraph",
  initial: "idle",
  context: {
    base_url: "",
    api_key: "",
    model: "",
  },
  states: {
    idle: {
      on: {
        ACTIVATE: "active",
      },
    },
    active: {
      on: {
        DEACTIVATE: "idle",
      },
    },
  },
  on: {
    SET_CONFIG: {
      actions: assign({
        base_url: ({ context, event }) => event.base_url ?? context.base_url,
        api_key: ({ context, event }) => event.api_key ?? context.api_key,
        model: ({ context, event }) => event.model ?? context.model,
      }),
    },
  },
});
