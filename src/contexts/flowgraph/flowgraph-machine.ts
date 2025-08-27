"use client";

import { assign, createMachine } from "xstate";
import type { Edge, Node } from "@xyflow/react";
import {
  applyLayout,
  applySplitLayout,
} from "@/lib/flowgraph/layout/flowgraph-layout-utils";

const LAYOUT_OPTIONS = { direction: "BT" } as const;
const SPLIT_OPTIONS = {
  groupId: "devbox-group",
  groupPadding: 20,
  gapBetweenGroupAndRest: 200,
  groupPosition: { x: -700, y: 0 },
  childNodeWidth: 280,
  childNodeHeight: 200,
  groupLayoutOptions: {
    direction: "BT",
    nodeWidth: 280,
    nodeHeight: 200,
    rankSep: 40,
    nodeSep: 20,
  },
  outsideLayoutOptions: LAYOUT_OPTIONS,
} as const;

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
  | { type: "CLEAR_SELECTED_EDGE" }
  | { type: "CLEAR_ALL_STATE" };

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
        nodes: ({ context, event }) =>
          applySplitLayout(
            [...context.nodes, event.node],
            context.edges,
            SPLIT_OPTIONS
          ),
      }),
    },
    ADD_EDGE: {
      actions: assign({
        edges: ({ context, event }) => [...context.edges, event.edge],
        nodes: ({ context, event }) =>
          applySplitLayout(
            context.nodes,
            [...context.edges, event.edge],
            SPLIT_OPTIONS
          ),
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
        selectedNode: ({ event }) => event.node,
        nodes: ({ context }) =>
          applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    SELECT_EDGE: {
      actions: assign({
        selectedEdge: ({ event }) => event.edge,
        nodes: ({ context }) =>
          applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    CLEAR_SELECTED_NODE: {
      actions: assign({
        selectedNode: () => null,
        nodes: ({ context }) =>
          applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    CLEAR_SELECTED_EDGE: {
      actions: assign({
        selectedEdge: () => null,
        nodes: ({ context }) =>
          applySplitLayout(context.nodes, context.edges, SPLIT_OPTIONS),
      }),
    },
    CLEAR_ALL_STATE: {
      actions: assign({
        nodes: () => [],
        edges: () => [],
        selectedNode: () => null,
        selectedEdge: () => null,
      }),
    },
  },
});
