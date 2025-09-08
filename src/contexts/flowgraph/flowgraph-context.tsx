"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { flowgraphMachine } from "@/contexts/flowgraph/flowgraph-machine";
import type { Edge, Node, EdgeChange, NodeChange } from "@xyflow/react";
import {
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";

// const inspector = createBrowserInspector();

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
      <FlowgraphFocusHandler />
      {children}
    </FlowgraphContext.Provider>
  );
};

// Component to handle node focusing and fit view triggers
function FlowgraphFocusHandler() {
  const { state } = useFlowgraphContext();
  const { fitView } = useReactFlow();

  // useEffect(() => {
  //   if (state.context.selectedNode) {
  //     fitView({
  //       nodes: [{ id: state.context.selectedNode }],
  //       padding: 0.2,
  //       duration: 0,
  //       maxZoom: 1,
  //     });
  //   }
  // }, [state.context.selectedNode]);

  // Handle programmatic fitView calls
  useEffect(() => {
    if (state.context.fitViewTrigger > 0) {
      fitView({
        padding: 0.1,
        duration: 300,
        maxZoom: 1.5,
      });
    }
  }, [state.context.fitViewTrigger]);

  return null;
}

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
  };
}

export function useFlowgraphActions() {
  const { state, send } = useFlowgraphContext();

  return {
    setNodes: (nodes: Node[]) => send({ type: "SET_NODES", nodes }),
    setEdges: (edges: Edge[]) => send({ type: "SET_EDGES", edges }),
    addNode: (node: Node) => send({ type: "ADD_NODE", node }),
    addEdge: (edge: Edge) => send({ type: "ADD_EDGE", edge }),
    updateNode: (node: Node) => send({ type: "UPDATE_NODE", node }),
    updateEdge: (edge: Edge) => send({ type: "UPDATE_EDGE", edge }),
    removeNode: (id: string) => send({ type: "REMOVE_NODE", id }),
    removeEdge: (id: string) => send({ type: "REMOVE_EDGE", id }),
    selectNode: (id: string) => send({ type: "SELECT_NODE", id }),
    selectEdge: (id: string) => send({ type: "SELECT_EDGE", id }),
    clearSelectedNode: () => send({ type: "CLEAR_SELECTED_NODE" }),
    clearSelectedEdge: () => send({ type: "CLEAR_SELECTED_EDGE" }),
    clearAllState: () => send({ type: "CLEAR_ALL_STATE" }),
    focusNode: (nodeId: string) => {
      const node = state.context.nodes.find((n) => n.id === nodeId);
      if (node) {
        send({ type: "SELECT_NODE", id: nodeId });
      }
    },
    onNodesChange: (changes: NodeChange[]) =>
      send({
        type: "SET_NODES",
        nodes: applyNodeChanges(changes, state.context.nodes),
      }),
    onEdgesChange: (changes: EdgeChange[]) =>
      send({
        type: "SET_EDGES",
        edges: applyEdgeChanges(changes, state.context.edges),
      }),
    fitView: () => send({ type: "FIT_VIEW" }),
  };
}
