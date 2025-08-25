import { assign, createMachine } from "xstate";
import type { BrainState, LanggraphEvent } from "./langgraph-schema";

export const langgraphMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: BrainState; events: LanggraphEvent },
  id: "langgraph",
  initial: "idle",
  context: {
    base_url: "",
    api_key: "",
    model: "",
    stage: "propose_project",
    project_context: {
      allProjects: [],
      selectedProject: "",
      selectedResource: null,
      selectedProjectResources: [],
    },
  },
  states: {
    idle: {},
    active: {},
  },
  on: {
    SET_CONFIG: {
      actions: assign({
        base_url: ({ context, event }) => event.base_url ?? context.base_url,
        api_key: ({ context, event }) => event.api_key ?? context.api_key,
        model: ({ context, event }) => event.model ?? context.model,
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
  },
});
