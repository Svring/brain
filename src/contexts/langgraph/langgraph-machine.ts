import { assign, createMachine } from "xstate";
import type { LanggraphAgentState, LanggraphEvent } from "./langgraph-schema";

export const langgraphMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: LanggraphAgentState; events: LanggraphEvent },
  id: "langgraph",
  initial: "idle",
  context: {
    base_url: "",
    api_key: "",
    model: "",
    project_context: {
      allProjects: [],
      selectedProject: null,
      selectedProjectResources: null,
    },
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
