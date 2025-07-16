"use client";

import { createMachine, assign } from "xstate";

export interface ProjectContext {
  homepageData: {
    projects: any;
  };
  flowGraphData: {
    project: any;
    resources: any;
  };
}

export type ProjectEvent =
  | { type: "ENTER_PROJECT" }
  | { type: "EXIT_PROJECT" }
  | { type: "SET_HOMEPAGE_DATA"; projects: any }
  | { type: "SET_FLOW_GRAPH_DATA"; project: any; resources: any };

export const projectMachine = createMachine({
  types: {} as { context: ProjectContext; events: ProjectEvent },
  id: "project",
  initial: "homepage",
  context: {
    homepageData: {
      projects: null,
    },
    flowGraphData: {
      project: null,
      resources: null,
    },
  },
  states: {
    homepage: {
      entry: () => {
        console.log("Entered homepage state");
      },
      exit: () => {
        console.log("Exited homepage state");
      },
      on: {
        ENTER_PROJECT: "flowGraph",
        SET_HOMEPAGE_DATA: {
          actions: assign({
            homepageData: {
              projects: (_: any, event: any) => event.projects,
            },
          }),
        },
      },
    },
    flowGraph: {
      entry: () => {
        console.log("Entered flowGraph state");
      },
      exit: () => {
        console.log("Exited flowGraph state");
      },
      on: {
        EXIT_PROJECT: "homepage",
        SET_FLOW_GRAPH_DATA: {
          actions: assign({
            flowGraphData: {
              project: (_: any, event: any) => event.project,
              resources: (_: any, event: any) => event.resources,
            },
          }),
        },
      },
    },
  },
});
