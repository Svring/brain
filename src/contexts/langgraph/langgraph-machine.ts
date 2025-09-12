import { assign, createMachine } from "xstate";
import type { BrainState, LanggraphEvent } from "./langgraph-schema";

export const langgraphMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: BrainState; events: LanggraphEvent },
  id: "langgraph",
  initial: "loading",
  context: {
    base_url: "",
    api_key: "",
    model_name: "",
    context_window_usage: 0,
    stage: "propose_project",
    project_context: {
      allProjects: [],
      selectedProject: "",
      selectedResource: null,
      selectedProjectResources: [],
    },
  },
  states: {
    loading: {
      on: {
        SET_CONFIG: {
          target: "loaded",
          actions: assign({
            base_url: ({ context, event }) =>
              event.base_url ?? context.base_url,
            api_key: ({ context, event }) => event.api_key ?? context.api_key,
            model_name: ({ context, event }) =>
              event.model_name ?? context.model_name,
          }),
        },
        SET_CONFIG_FAILED: {
          target: "unloaded",
        },
      },
    },
    loaded: {
      on: {
        SET_CONFIG: {
          actions: assign({
            base_url: ({ context, event }) =>
              event.base_url ?? context.base_url,
            api_key: ({ context, event }) => event.api_key ?? context.api_key,
            model_name: ({ context, event }) =>
              event.model_name ?? context.model_name,
          }),
        },
      },
    },
    unloaded: {
      on: {
        SET_CONFIG: {
          target: "loaded",
          actions: assign({
            base_url: ({ context, event }) =>
              event.base_url ?? context.base_url,
            api_key: ({ context, event }) => event.api_key ?? context.api_key,
            model_name: ({ context, event }) =>
              event.model_name ?? context.model_name,
          }),
        },
      },
    },
    idle: {},
    active: {},
  },
  on: {
    SET_CONFIG: {
      actions: assign({
        base_url: ({ context, event }) => event.base_url ?? context.base_url,
        api_key: ({ context, event }) => event.api_key ?? context.api_key,
        model_name: ({ context, event }) =>
          event.model_name ?? context.model_name,
      }),
    },
    SET_STAGE: {
      actions: assign({
        stage: ({ event }) => event.stage,
      }),
    },
    SET_PROJECT_CONTEXT: {
      actions: assign({
        project_context: ({ event }) => event.project_context,
      }),
    },
    SET_CONTEXT_WINDOW_USAGE: {
      actions: assign({
        context_window_usage: ({ event }) => event.context_window_usage,
      }),
    },
  },
});
