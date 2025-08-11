"use client";

import { assign, createMachine } from "xstate";

export interface Node {
  id: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface Edge {
  id: string;
  source?: string;
  target?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface FlowgraphContext {
  nodes: Node[];
  edges: Edge[];
  selectedNode: any;
  selectedEdge: any;
}

export type FlowgraphEvent =
  | { type: "SET_NODES"; nodes: Node[] }
  | { type: "SET_EDGES"; edges: Edge[] }
  | { type: "ADD_NODE"; node: Node }
  | { type: "ADD_EDGE"; edge: Edge }
  | { type: "UPDATE_NODE"; node: Node }
  | { type: "UPDATE_EDGE"; edge: Edge }
  | { type: "REMOVE_NODE"; id: string }
  | { type: "REMOVE_EDGE"; id: string }
  | { type: "SELECT_NODE"; node: any }
  | { type: "SELECT_EDGE"; edge: any }
  | { type: "CLEAR_SELECTED_NODE" }
  | { type: "CLEAR_SELECTED_EDGE" };

export const flowgraphMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: FlowgraphContext; events: FlowgraphEvent },
  id: "flowgraph",
  initial: "idle",
  context: {
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
  },
  states: {
    idle: {},
  },
  on: {
    SET_NODES: {
      actions: assign({ nodes: ({ event }) => event.nodes }),
    },
    SET_EDGES: {
      actions: assign({ edges: ({ event }) => event.edges }),
    },
    ADD_NODE: {
      actions: assign({ nodes: ({ context, event }) => [...context.nodes, event.node] }),
    },
    ADD_EDGE: {
      actions: assign({ edges: ({ context, event }) => [...context.edges, event.edge] }),
    },
    UPDATE_NODE: {
      actions: assign({
        nodes: ({ context, event }) =>
          context.nodes.map((n) => (n.id === event.node.id ? { ...n, ...event.node } : n)),
      }),
    },
    UPDATE_EDGE: {
      actions: assign({
        edges: ({ context, event }) =>
          context.edges.map((e) => (e.id === event.edge.id ? { ...e, ...event.edge } : e)),
      }),
    },
    REMOVE_NODE: {
      actions: assign({ nodes: ({ context, event }) => context.nodes.filter((n) => n.id !== event.id) }),
    },
    REMOVE_EDGE: {
      actions: assign({ edges: ({ context, event }) => context.edges.filter((e) => e.id !== event.id) }),
    },
    SELECT_NODE: {
      actions: assign({ selectedNode: ({ event }) => event.node }),
    },
    SELECT_EDGE: {
      actions: assign({ selectedEdge: ({ event }) => event.edge }),
    },
    CLEAR_SELECTED_NODE: {
      actions: assign({ selectedNode: () => null }),
    },
    CLEAR_SELECTED_EDGE: {
      actions: assign({ selectedEdge: () => null }),
    },
  },
});


