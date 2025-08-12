"use client";

import { assign, createMachine } from "xstate";
import type { Edge, Node } from "@xyflow/react";
import { applyLayout } from "@/lib/flowgraph/layout/flowgraph-layout-utils";

const LAYOUT_OPTIONS = { direction: "BT" } as const;

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
      actions: assign({
        nodes: ({ context, event }) =>
          applyLayout(event.nodes, context.edges, LAYOUT_OPTIONS),
      }),
    },
    SET_EDGES: {
      actions: assign({
        edges: ({ event }) => event.edges,
        nodes: ({ context, event }) =>
          applyLayout(context.nodes, event.edges, LAYOUT_OPTIONS),
      }),
    },
    ADD_NODE: {
      actions: assign({
        nodes: ({ context, event }) =>
          applyLayout(
            [...context.nodes, event.node],
            context.edges,
            LAYOUT_OPTIONS
          ),
      }),
    },
    ADD_EDGE: {
      actions: assign({
        edges: ({ context, event }) => [...context.edges, event.edge],
        nodes: ({ context, event }) =>
          applyLayout(
            context.nodes,
            [...context.edges, event.edge],
            LAYOUT_OPTIONS
          ),
      }),
    },
    UPDATE_NODE: {
      actions: assign({
        nodes: ({ context, event }) =>
          applyLayout(
            context.nodes.map((n) =>
              n.id === event.node.id ? { ...n, ...event.node } : n
            ),
            context.edges,
            LAYOUT_OPTIONS
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
          applyLayout(
            context.nodes,
            context.edges.map((e) =>
              e.id === event.edge.id ? { ...e, ...event.edge } : e
            ),
            LAYOUT_OPTIONS
          ),
      }),
    },
    REMOVE_NODE: {
      actions: assign({
        nodes: ({ context, event }) =>
          applyLayout(
            context.nodes.filter((n) => n.id !== event.id),
            context.edges,
            LAYOUT_OPTIONS
          ),
      }),
    },
    REMOVE_EDGE: {
      actions: assign({
        edges: ({ context, event }) =>
          context.edges.filter((e) => e.id !== event.id),
        nodes: ({ context, event }) =>
          applyLayout(
            context.nodes,
            context.edges.filter((e) => e.id !== event.id),
            LAYOUT_OPTIONS
          ),
      }),
    },
    SELECT_NODE: {
      actions: assign({
        selectedNode: ({ event }) => event.node,
        nodes: ({ context }) =>
          applyLayout(context.nodes, context.edges, LAYOUT_OPTIONS),
      }),
    },
    SELECT_EDGE: {
      actions: assign({
        selectedEdge: ({ event }) => event.edge,
        nodes: ({ context }) =>
          applyLayout(context.nodes, context.edges, LAYOUT_OPTIONS),
      }),
    },
    CLEAR_SELECTED_NODE: {
      actions: assign({
        selectedNode: () => null,
        nodes: ({ context }) =>
          applyLayout(context.nodes, context.edges, LAYOUT_OPTIONS),
      }),
    },
    CLEAR_SELECTED_EDGE: {
      actions: assign({
        selectedEdge: () => null,
        nodes: ({ context }) =>
          applyLayout(context.nodes, context.edges, LAYOUT_OPTIONS),
      }),
    },
  },
});
