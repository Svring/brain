"use client";

import { assign, createMachine } from "xstate";
import type { Edge, Node } from "@xyflow/react";
import { applySplitLayout } from "@/lib/flowgraph/layout";

const LAYOUT_OPTIONS = { direction: "BT", rankSep: 150, nodeSep: 150 } as const;
const SPLIT_OPTIONS = {
  groupId: "devbox-group",
  groupPadding: 20,
  gapBetweenGroupAndRest: 200,
  groupPosition: { x: -700, y: 0 },
  childNodeWidth: 280,
  childNodeHeight: 200,
  // Account for smaller network nodes inside the group
  // StatefulSet nodes are taller due to hem component
  getChildNodeSize: (node: Node) => {
    if (node.type === "network") {
      return { width: 280, height: 56 };
    }
    if (node.type === "statefulset") {
      return { width: 280, height: 240 }; // h-60 in Tailwind = 240px (hem component height)
    }
    return { width: 280, height: 200 };
  },
  // Treat network nodes as shorter than default nodes during outside layout
  // StatefulSet nodes are taller due to hem component
  getOutsideNodeSize: (node: Node) => {
    if (node.type === "network") {
      return { width: 280, height: 56 }; // h-14 in Tailwind = 56px
    }
    if (node.type === "statefulset") {
      return { width: 280, height: 240 }; // h-60 in Tailwind = 240px (hem component height)
    }
    return { width: 280, height: 200 };
  },
  groupLayoutOptions: {
    ...LAYOUT_OPTIONS,
    edgeAware: true,
    barycentricIterations: 3,
  },
  outsideLayoutOptions: {
    ...LAYOUT_OPTIONS,
    edgeAware: true,
    barycentricIterations: 3,
  },
} as const;

export interface FlowgraphContext {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  fitViewTrigger: number;
  refreshTrigger: number;
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
  | { type: "SELECT_NODE"; id: string }
  | { type: "SELECT_EDGE"; id: string }
  | { type: "CLEAR_SELECTED_NODE" }
  | { type: "CLEAR_SELECTED_EDGE" }
  | { type: "CLEAR_ALL_STATE" }
  | { type: "FIT_VIEW" }
  | { type: "REFRESH" };

export const flowgraphMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: FlowgraphContext; events: FlowgraphEvent },
  id: "flowgraph",
  initial: "idle",
  context: {
    nodes: [],
    edges: [],
    selectedNode: "",
    selectedEdge: "",
    fitViewTrigger: 0,
    refreshTrigger: 0,
  },
  states: {
    idle: {},
  },
  on: {
    SET_NODES: {
      actions: assign({
        nodes: ({ context, event }) =>
          applySplitLayout(event.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    SET_EDGES: {
      actions: assign({
        edges: ({ event }) => event.edges,
        nodes: ({ context, event }) =>
          applySplitLayout(context.nodes, event.edges, SPLIT_OPTIONS),
      }),
    },
    ADD_NODE: {
      actions: assign({
        nodes: ({ context, event }) => {
          // Check if node already exists
          const existingNode = context.nodes.find(
            (n) => n.id === event.node.id
          );
          if (existingNode) {
            return context.nodes; // Don't add duplicate
          }
          return applySplitLayout(
            [...context.nodes, event.node],
            context.edges,
            SPLIT_OPTIONS
          );
        },
      }),
    },
    ADD_EDGE: {
      actions: assign({
        edges: ({ context, event }) => {
          // Check if edge already exists
          const existingEdge = context.edges.find(
            (e) => e.id === event.edge.id
          );
          if (existingEdge) {
            return context.edges; // Don't add duplicate
          }
          return [...context.edges, event.edge];
        },
        nodes: ({ context, event }) => {
          // Only re-layout if edge was actually added
          const existingEdge = context.edges.find(
            (e) => e.id === event.edge.id
          );
          if (existingEdge) {
            return context.nodes; // Don't re-layout for duplicates
          }
          return applySplitLayout(
            context.nodes,
            [...context.edges, event.edge],
            SPLIT_OPTIONS
          );
        },
      }),
    },
    UPDATE_NODE: {
      actions: assign({
        nodes: ({ context, event }) =>
          applySplitLayout(
            context.nodes.map((n) =>
              n.id === event.node.id ? { ...n, ...event.node } : n
            ),
            context.edges,
            SPLIT_OPTIONS
          ),
      }),
    },
    UPDATE_EDGE: {
      actions: assign({
        edges: ({ context, event }) =>
          context.edges.map((e) =>
            e.id === event.edge.id ? { ...e, ...event.edge } : e
          ),
        nodes: ({ context, event }) =>
          applySplitLayout(
            context.nodes,
            context.edges.map((e) =>
              e.id === event.edge.id ? { ...e, ...event.edge } : e
            ),
            SPLIT_OPTIONS
          ),
      }),
    },
    REMOVE_NODE: {
      actions: assign({
        nodes: ({ context, event }) =>
          applySplitLayout(
            context.nodes.filter((n) => n.id !== event.id),
            context.edges,
            SPLIT_OPTIONS
          ),
      }),
    },
    REMOVE_EDGE: {
      actions: assign({
        edges: ({ context, event }) =>
          context.edges.filter((e) => e.id !== event.id),
        nodes: ({ context, event }) =>
          applySplitLayout(
            context.nodes,
            context.edges.filter((e) => e.id !== event.id),
            SPLIT_OPTIONS
          ),
      }),
    },
    SELECT_NODE: {
      actions: assign({
        selectedNode: ({ event }) => event.id,
        // nodes: ({ context }) =>
        //   // applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
        //   context.nodes,
      }),
    },
    SELECT_EDGE: {
      actions: assign({
        selectedEdge: ({ event }) => event.id,
        // nodes: ({ context }) =>
        //   applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    CLEAR_SELECTED_NODE: {
      actions: assign({
        selectedNode: () => null,
        // nodes: ({ context }) =>
        //   applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    CLEAR_SELECTED_EDGE: {
      actions: assign({
        selectedEdge: () => null,
        // nodes: ({ context }) =>
        //   applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    CLEAR_ALL_STATE: {
      actions: assign({
        nodes: () => [],
        edges: () => [],
        selectedNode: () => null,
        selectedEdge: () => null,
        fitViewTrigger: () => 0,
        refreshTrigger: () => 0,
      }),
    },
    FIT_VIEW: {
      actions: assign({
        fitViewTrigger: ({ context }) => context.fitViewTrigger + 1,
      }),
    },
    REFRESH: {
      actions: assign({
        refreshTrigger: ({ context }) => context.refreshTrigger + 1,
      }),
    },
  },
});
