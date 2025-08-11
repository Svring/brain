"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { flowgraphMachine } from "@/contexts/flowgraph/flowgraph-machine";

// const inspector = createBrowserInspector();

interface FlowgraphContextValue {
  state: StateFrom<typeof flowgraphMachine>;
  send: (event: EventFrom<typeof flowgraphMachine>) => void;
  actorRef: ActorRefFrom<typeof flowgraphMachine>;
}

export const FlowgraphContext =
  createContext<FlowgraphContextValue | undefined>(undefined);

export const FlowgraphProvider = ({ children }: { children: ReactNode }) => {
  const [state, send, actorRef] = useMachine(flowgraphMachine, {
    // inspect: inspector.inspect,
  });

  return (
    <FlowgraphContext.Provider value={{ state, send, actorRef }}>
      {children}
    </FlowgraphContext.Provider>
  );
};

export function useFlowgraphContext() {
  const ctx = useContext(FlowgraphContext);
  if (!ctx)
    throw new Error(
      "useFlowgraphContext must be used within FlowgraphProvider"
    );
  return ctx;
}

export function useFlowgraphState() {
  const { state } = useFlowgraphContext();
  return {
    nodes: state.context.nodes,
    edges: state.context.edges,
    selectedNode: state.context.selectedNode,
    selectedEdge: state.context.selectedEdge,
  };
}

export function useFlowgraphActions() {
  const { send } = useFlowgraphContext();

  return {
    setNodes: (nodes: Array<{ id: string }>) => send({ type: "SET_NODES", nodes }),
    setEdges: (edges: Array<{ id: string }>) => send({ type: "SET_EDGES", edges }),
    addNode: (node: { id: string }) => send({ type: "ADD_NODE", node }),
    addEdge: (edge: { id: string }) => send({ type: "ADD_EDGE", edge }),
    updateNode: (node: { id: string }) => send({ type: "UPDATE_NODE", node }),
    updateEdge: (edge: { id: string }) => send({ type: "UPDATE_EDGE", edge }),
    removeNode: (id: string) => send({ type: "REMOVE_NODE", id }),
    removeEdge: (id: string) => send({ type: "REMOVE_EDGE", id }),
    selectNode: (node: unknown) => send({ type: "SELECT_NODE", node }),
    selectEdge: (edge: unknown) => send({ type: "SELECT_EDGE", edge }),
    clearSelectedNode: () => send({ type: "CLEAR_SELECTED_NODE" }),
    clearSelectedEdge: () => send({ type: "CLEAR_SELECTED_EDGE" }),
  };
}


