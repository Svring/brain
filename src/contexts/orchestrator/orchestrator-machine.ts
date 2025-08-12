"use client";

import { assign, createMachine } from "xstate";

export interface OrchestratorProjectSnapshot {
  totalProjects: number;
  selectedProject: unknown | null;
  selectedProjectResources: unknown | null;
}

export interface OrchestratorFlowgraphSnapshot {
  nodeCount: number;
  edgeCount: number;
  selectedNode: any;
  selectedEdge: any;
}

export interface OrchestratorContext {
  project: OrchestratorProjectSnapshot;
  flowgraph: OrchestratorFlowgraphSnapshot;
}

export type OrchestratorEvent =
  | { type: "PROJECT_UPDATED"; project: OrchestratorProjectSnapshot }
  | { type: "FLOWGRAPH_UPDATED"; flowgraph: OrchestratorFlowgraphSnapshot };

export const orchestratorMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: OrchestratorContext; events: OrchestratorEvent },
  id: "orchestrator",
  initial: "ready",
  context: {
    project: {
      totalProjects: 0,
      selectedProject: null,
      selectedProjectResources: null,
    },
    flowgraph: {
      nodeCount: 0,
      edgeCount: 0,
      selectedNode: null,
      selectedEdge: null,
    },
  },
  states: {
    ready: {},
  },
  on: {
    PROJECT_UPDATED: {
      actions: assign({ project: ({ event }) => event.project }),
    },
    FLOWGRAPH_UPDATED: {
      actions: assign({ flowgraph: ({ event }) => event.flowgraph }),
    },
  },
});

