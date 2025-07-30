"use client";

import { assign, createMachine } from "xstate";
import type { Edge, Node } from "@xyflow/react";

export interface FlowContext {
  nodes: Node[];
  edges: Edge[];
  selectedNode: any;
  selectedEdge: any;
  isInitialized: boolean;
  isDragging: boolean;
}

export type FlowEvent =
  | { type: "SET_FLOW_DATA"; nodes: Node[]; edges: Edge[] }
  | { type: "UPDATE_NODES"; nodes: Node[] }
  | { type: "UPDATE_EDGES"; edges: Edge[] }
  | { type: "UPDATE_SINGLE_NODE"; id: string; node: Partial<Node> }
  | { type: "UPDATE_SINGLE_EDGE"; id: string; edge: Partial<Edge> }
  | { type: "SET_SELECTED_NODE"; node: any }
  | { type: "SET_SELECTED_EDGE"; edge: any }
  | { type: "SET_DRAGGING"; isDragging: boolean }
  | { type: "RESET_FLOW" };

export const flowMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AVmAhgdwAsBbAY0VQBcA6AU3RAFkBjAe22IC9aBlbAJjr9GrDt148+AkWMnSZ1WozYBPAOIAFAGICqLVW0qMAnhKnTZBhgDskSQ2JoLmq9g+4CqTqYvdGfF1R5JShWJhYOXgiJKVkFFTUNFW9fY2YmGxdWcMjI6LiElXkGY0EJSWkGXmVVLV11TRCrPK8wpwIfP2MJU3KKqJr42sUkyrtOl07O2C7evr9JZOVODg0yqL9fDJtCtqE85wKutdT4jZ8JQ1NOSeMKsfXvYomtyUMJZaVPDgLJPdBc5a-PKGUpNDLaQFWGwBaFgnbuOH5cRaLY-Kp7Oo-ERQkKQqEOWEPOEorYhCEaKGtJpzELrbaaDTeUHQmGCPYBf5lMrQ-I4p7pV6Zd5QqpSDggsEQvZbbaFABqAA8AIoyTh2fhkBkAApgZlsxjcrn8gDyiCogtS4t6-PFAB5cUUlRlCr0euJJOwZrqdbqjQRhBa6tbuowGG8dTSJvMZnN7bN9h6vT7VXq-QHhIGg3CdSKOcLRaxI6Go0jDGjhjwkwbkxqKKRFcnFfzJWl+lKSzKaUqOdxuOLJcqJSmc3ntRYXWsPI6K4X3UEGBVa4K5eLoyo6zWVZWJ2I2-3BwOhzbQzb+wWGEOLSPZ3PrYvaxXJxPZ9PF52u1vwZO55WfecF1ZTdP23YciFAJJtxfT93z+H8gP-GDAJ-CCYJ3OC4IQr9f1AqDQJ3CCuxtU8b1fR9XzFbdb2+LMT3Io8W1zZcJXbQFgU4qN+L-RCsMHCih2HUdx0nYxpAXJcV3XZUt13fcR0PNji0YssyMkm8aIlc9JR7PUK1zFtsII1SBKA+SkNQlc0LXDddGMtcjOuO97w3O9Hy8w8VVMwt2LvDsnys+8ZTvNsrI-My20YjjOL-YcxECqCh2E1dDKShyxOcwFPKuei7wY69xLvaiR1bUz2w0xjUt0kdksysEeIs5tJOCqL-KfG1W3tf9mxXJKlzS9i6wnGC4qE-zooK5KRzKkr-iqqKfLM9iF1YnjGP-CyFrUwFdICtaVJmsbJo89cFqW4TFtWha9qfFydvnJKDqSq87vOhtArM8rgoQrKouMgJCMu67Ir2y7bssjyXp4-zyui5qNr2lLdqEqFWGHMDsMKjKIaagGwZA8GYc6uKsq8g6DyC+HkZS462yxjGOvW7GXpanHsYJw6SaOsm5ppmKHuKzm3u5w8+cZh8QKQT8+cFq6gcIstgPZtqgYBo72wY1aStAA */
  types: {} as { context: FlowContext; events: FlowEvent },
  id: "flow",
  initial: "idle",
  context: {
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    isInitialized: false,
    isDragging: false,
  },
  states: {
    idle: {
      on: {
        SET_FLOW_DATA: {
          target: "ready",
          actions: assign({
            nodes: ({ event }) => event.nodes,
            edges: ({ event }) => event.edges,
            isInitialized: true,
          }),
        },
      },
    },
    ready: {
      on: {
        SET_FLOW_DATA: {
          actions: assign({
            nodes: ({ event }) => event.nodes,
            edges: ({ event }) => event.edges,
          }),
        },
        UPDATE_NODES: {
          actions: assign({
            nodes: ({ event }) => event.nodes,
          }),
        },
        UPDATE_EDGES: {
          actions: assign({
            edges: ({ event }) => event.edges,
          }),
        },
        UPDATE_SINGLE_NODE: {
          actions: assign({
            nodes: ({ context, event }) =>
              context.nodes.map((node) =>
                node.id === event.id ? { ...node, ...event.node } : node
              ),
          }),
        },
        UPDATE_SINGLE_EDGE: {
          actions: assign({
            edges: ({ context, event }) =>
              context.edges.map((edge) =>
                edge.id === event.id ? { ...edge, ...event.edge } : edge
              ),
          }),
        },
        SET_SELECTED_NODE: {
          actions: assign({
            selectedNode: ({ event }) => event.node,
          }),
        },
        SET_SELECTED_EDGE: {
          actions: assign({
            selectedEdge: ({ event }) => event.edge,
          }),
        },
        SET_DRAGGING: {
          actions: assign({
            isDragging: ({ event }) => event.isDragging,
          }),
        },
        RESET_FLOW: {
          target: "idle",
          actions: assign({
            nodes: [],
            edges: [],
            selectedNode: null,
            selectedEdge: null,
            isInitialized: false,
            isDragging: false,
          }),
        },
      },
    },
  },
});
