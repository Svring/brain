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
    stage: "project",
    project_proposal: {
      name: "",
      description: "",
      resources: {
        devboxes: [],
        databases: [],
        buckets: [],
      },
    },
    resource_context: null,
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
    SET_STAGE: {
      actions: assign({
        stage: ({ event }) => event.stage,
      }),
    },
    SET_PROJECT_PROPOSAL: {
      actions: assign({
        project_proposal: ({ event }) => event.project_proposal,
      }),
    },
    SET_RESOURCE_CONTEXT: {
      actions: assign({
        resource_context: ({ event }) => event.resource_context,
      }),
    },
  },
});
