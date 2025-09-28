"use client";

import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { flowgraphMachine } from "@/contexts/flowgraph/flowgraph-machine";
import type { Edge, Node } from "@xyflow/react";

interface FlowgraphContextValue {
  state: StateFrom<typeof flowgraphMachine>;
  send: (event: EventFrom<typeof flowgraphMachine>) => void;
  actorRef: ActorRefFrom<typeof flowgraphMachine>;
}

export const FlowgraphContext = createContext<
  FlowgraphContextValue | undefined
>(undefined);

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
    fitViewTrigger: state.context.fitViewTrigger,
    refreshTrigger: state.context.refreshTrigger,
    hasUserPositions: state.context.hasUserPositions,
  };
}

export const useFlowgraphActions = () => {
  const context = useContext(FlowgraphContext);
  if (!context) {
    throw new Error(
      "useFlowgraphActions must be used within a FlowgraphProvider"
    );
  }

  const { send } = context;

  return {
    setNodes: (nodes: Node[], skipLayout?: boolean) =>
      send({ type: "SET_NODES", nodes, skipLayout }),
    setEdges: (edges: Edge[]) => send({ type: "SET_EDGES", edges }),
    addNode: (node: Node) => send({ type: "ADD_NODE", node }),
    addEdge: (edge: Edge) => send({ type: "ADD_EDGE", edge }),
    updateNode: (node: Node) => send({ type: "UPDATE_NODE", node }),
    updateNodePosition: (id: string, position: { x: number; y: number }) =>
      send({ type: "UPDATE_NODE_POSITION", id, position }),
    updateEdge: (edge: Edge) => send({ type: "UPDATE_EDGE", edge }),
    removeNode: (id: string) => send({ type: "REMOVE_NODE", id }),
    removeEdge: (id: string) => send({ type: "REMOVE_EDGE", id }),
    selectNode: (id: string) => send({ type: "SELECT_NODE", id }),
    selectEdge: (id: string) => send({ type: "SELECT_EDGE", id }),
    clearSelectedNode: () => send({ type: "CLEAR_SELECTED_NODE" }),
    clearSelectedEdge: () => send({ type: "CLEAR_SELECTED_EDGE" }),
    clearAllState: () => send({ type: "CLEAR_ALL_STATE" }),
    fitView: () => send({ type: "FIT_VIEW" }),
    refresh: () => send({ type: "REFRESH" }),
    startDragging: () => send({ type: "START_DRAGGING" }),
    stopDragging: () => send({ type: "STOP_DRAGGING" }),
    setHasUserPositions: (value: boolean) =>
      send({ type: "SET_HAS_USER_POSITIONS", value }),
  };
};

