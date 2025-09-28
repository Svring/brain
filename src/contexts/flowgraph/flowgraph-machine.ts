"use client";

import { assign, createMachine } from "xstate";
import type { Edge, Node } from "@xyflow/react";
import { applyLayout } from "@/lib/flowgraph/layout/normal-layout";

const LAYOUT_OPTIONS = { 
  direction: "BT" as const, 
  rankSep: 150, 
  nodeSep: 150,
  getNodeSize: (node: Node) => {
    if (node.type === "network") {
      return { width: 280, height: 56 };
    }
    if (node.type === "statefulset") {
      return { width: 280, height: 240 };
    }
    return { width: 280, height: 200 };
  },
};

export interface FlowgraphContext {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  fitViewTrigger: number;
  refreshTrigger: number;
  isDragging: boolean;
  hasUserPositions: boolean;
}

export type FlowgraphEvent =
  | { type: "SET_NODES"; nodes: Node[]; skipLayout?: boolean }
  | { type: "SET_EDGES"; edges: Edge[] }
  | { type: "ADD_NODE"; node: Node }
  | { type: "ADD_EDGE"; edge: Edge }
  | { type: "UPDATE_NODE"; node: Node }
  | { type: "UPDATE_NODE_POSITION"; id: string; position: { x: number; y: number } }
  | { type: "UPDATE_EDGE"; edge: Edge }
  | { type: "REMOVE_NODE"; id: string }
  | { type: "REMOVE_EDGE"; id: string }
  | { type: "SELECT_NODE"; id: string }
  | { type: "SELECT_EDGE"; id: string }
  | { type: "CLEAR_SELECTED_NODE" }
  | { type: "CLEAR_SELECTED_EDGE" }
  | { type: "CLEAR_ALL_STATE" }
  | { type: "FIT_VIEW" }
  | { type: "REFRESH" }
  | { type: "START_DRAGGING" }
  | { type: "STOP_DRAGGING" }
  | { type: "SET_HAS_USER_POSITIONS"; value: boolean };

export const flowgraphMachine = createMachine({
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
    isDragging: false,
    hasUserPositions: false,
  },
  states: {
    idle: {},
  },
  on: {
    SET_NODES: {
      actions: assign({
        nodes: ({ context, event }) => {
          if (event.skipLayout || context.hasUserPositions) {
            return event.nodes;
          }
          return applyLayout(event.nodes, context.edges, LAYOUT_OPTIONS);
        },
      }),
    },
    SET_EDGES: {
      actions: assign({
        edges: ({ event }) => event.edges,
        nodes: ({ context, event }) => {
          if (context.hasUserPositions) {
            return context.nodes;
          }
          return applyLayout(context.nodes, event.edges, LAYOUT_OPTIONS);
        },
      }),
    },
    ADD_NODE: {
      actions: assign({
        nodes: ({ context, event }) => {
          const existingNode = context.nodes.find(
            (n) => n.id === event.node.id
          );
          if (existingNode) {
            return context.nodes;
          }
          if (context.hasUserPositions) {
            return [...context.nodes, event.node];
          }
          return applyLayout(
            [...context.nodes, event.node],
            context.edges,
            LAYOUT_OPTIONS
          );
        },
      }),
    },
    ADD_EDGE: {
      actions: assign({
        edges: ({ context, event }) => {
          const existingEdge = context.edges.find(
            (e) => e.id === event.edge.id
          );
          if (existingEdge) {
            return context.edges;
          }
          return [...context.edges, event.edge];
        },
        nodes: ({ context, event }) => {
          const existingEdge = context.edges.find(
            (e) => e.id === event.edge.id
          );
          if (existingEdge || context.hasUserPositions) {
            return context.nodes;
          }
          return applyLayout(
            context.nodes,
            [...context.edges, event.edge],
            LAYOUT_OPTIONS
          );
        },
      }),
    },
    UPDATE_NODE: {
      actions: assign({
        nodes: ({ context, event }) => {
          const updatedNodes = context.nodes.map((n) =>
            n.id === event.node.id ? { ...n, ...event.node } : n
          );
          if (context.hasUserPositions) {
            return updatedNodes;
          }
          return applyLayout(updatedNodes, context.edges, LAYOUT_OPTIONS);
        },
      }),
    },
    UPDATE_NODE_POSITION: {
      actions: assign({
        nodes: ({ context, event }) =>
          context.nodes.map((n) =>
            n.id === event.id
              ? { ...n, position: event.position }
              : n
          ),
        hasUserPositions: () => true,
      }),
    },
    UPDATE_EDGE: {
      actions: assign({
        edges: ({ context, event }) =>
          context.edges.map((e) =>
            e.id === event.edge.id ? { ...e, ...event.edge } : e
          ),
        nodes: ({ context, event }) => {
          if (context.hasUserPositions) {
            return context.nodes;
          }
          return applyLayout(
            context.nodes,
            context.edges.map((e) =>
              e.id === event.edge.id ? { ...e, ...event.edge } : e
            ),
            LAYOUT_OPTIONS
          );
        },
      }),
    },
    REMOVE_NODE: {
      actions: assign({
        nodes: ({ context, event }) => {
          const filteredNodes = context.nodes.filter((n) => n.id !== event.id);
          if (context.hasUserPositions) {
            return filteredNodes;
          }
          return applyLayout(filteredNodes, context.edges, LAYOUT_OPTIONS);
        },
      }),
    },
    REMOVE_EDGE: {
      actions: assign({
        edges: ({ context, event }) =>
          context.edges.filter((e) => e.id !== event.id),
        nodes: ({ context, event }) => {
          if (context.hasUserPositions) {
            return context.nodes;
          }
          return applyLayout(
            context.nodes,
            context.edges.filter((e) => e.id !== event.id),
            LAYOUT_OPTIONS
          );
        },
      }),
    },
    SELECT_NODE: {
      actions: assign({
        selectedNode: ({ event }) => event.id,
      }),
    },
    SELECT_EDGE: {
      actions: assign({
        selectedEdge: ({ event }) => event.id,
      }),
    },
    CLEAR_SELECTED_NODE: {
      actions: assign({
        selectedNode: () => null,
      }),
    },
    CLEAR_SELECTED_EDGE: {
      actions: assign({
        selectedEdge: () => null,
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
        isDragging: () => false,
        hasUserPositions: () => false,
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
    START_DRAGGING: {
      actions: assign({
        isDragging: () => true,
      }),
    },
    STOP_DRAGGING: {
      actions: assign({
        isDragging: () => false,
      }),
    },
    SET_HAS_USER_POSITIONS: {
      actions: assign({
        hasUserPositions: ({ event }) => event.value,
      }),
    },
  },
});