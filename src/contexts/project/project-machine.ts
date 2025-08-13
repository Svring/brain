"use client";

import { assign, createMachine } from "xstate";

export interface ProjectContextState {
  allProjects: unknown[];
  selectedProject: string | null;
  selectedProjectResources: unknown | null;
}

export type ProjectEvent =
  | { type: "SET_ALL_PROJECTS"; projects: unknown[] }
  | { type: "SELECT_PROJECT"; project: unknown }
  | { type: "CLEAR_SELECTED_PROJECT" }
  | { type: "SET_SELECTED_PROJECT_RESOURCES"; resources: unknown }
  | { type: "CLEAR_SELECTED_PROJECT_RESOURCES" };

export const projectMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: ProjectContextState; events: ProjectEvent },
  id: "project",
  initial: "idle",
  context: {
    allProjects: [],
    selectedProject: null,
    selectedProjectResources: null,
  },
  states: {
    idle: {},
  },
  on: {
    SET_ALL_PROJECTS: {
      actions: assign({ allProjects: ({ event }) => event.projects }),
    },
    SELECT_PROJECT: {
      actions: assign({
        selectedProject: ({ event }) => event.project as string,
      }),
    },
    CLEAR_SELECTED_PROJECT: {
      actions: assign({ selectedProject: () => null }),
    },
    SET_SELECTED_PROJECT_RESOURCES: {
      actions: assign({
        selectedProjectResources: ({ event }) => event.resources,
      }),
    },
    CLEAR_SELECTED_PROJECT_RESOURCES: {
      actions: assign({ selectedProjectResources: () => null }),
    },
  },
});
