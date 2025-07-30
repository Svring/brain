"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import _ from "lodash";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { flowMachine } from "./flow-machine";
import type { Edge, Node } from "@xyflow/react";
import useAI from "@/hooks/ai/use-ai";

const inspector = createBrowserInspector();

interface FlowContextValue {
  state: any;
  send: any;
  actorRef: any;
}

export const FlowContext = createContext<FlowContextValue | undefined>(
  undefined
);

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [state, send, actorRef] = useMachine(flowMachine, {
    inspect: inspector.inspect,
  });

  const { state: aiState, setState: setAIState } = useAI();

  useEffect(() => {
    const newState = _.cloneDeep(aiState);
    _.set(newState, "flow_context.nodes", state.context.nodes);
    _.set(newState, "flow_context.edges", state.context.edges);
    _.set(newState, "flow_context.selectedNode", state.context.selectedNode);
    _.set(newState, "flow_context.selectedEdge", state.context.selectedEdge);
    _.set(newState, "flow_context.isInitialized", state.context.isInitialized);
    setAIState(newState);
  }, [state]);

  return (
    <FlowContext.Provider value={{ state, send, actorRef }}>
      {children}
    </FlowContext.Provider>
  );
};

export function useFlowContext() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlowContext must be used within FlowProvider");
  return ctx;
}

export function useFlowState() {
  const { state } = useFlowContext();
  return {
    nodes: state.context.nodes as Node[],
    edges: state.context.edges as Edge[],
    selectedNode: state.context.selectedNode as any,
    selectedEdge: state.context.selectedEdge as any,
    isInitialized: state.context.isInitialized as boolean,
    isDragging: state.context.isDragging as boolean,
    isReady: state.matches("ready"),
  };
}

export function useFlowActions() {
  const { send } = useFlowContext();

  return {
    setFlowData: (nodes: Node[], edges: Edge[]) =>
      send({ type: "SET_FLOW_DATA", nodes, edges }),
    updateNodes: (nodes: Node[]) => send({ type: "UPDATE_NODES", nodes }),
    updateEdges: (edges: Edge[]) => send({ type: "UPDATE_EDGES", edges }),
    updateSingleNode: (id: string, node: Partial<Node>) =>
      send({ type: "UPDATE_SINGLE_NODE", id, node }),
    updateSingleEdge: (id: string, edge: Partial<Edge>) =>
      send({ type: "UPDATE_SINGLE_EDGE", id, edge }),
    setSelectedNode: (node: any) => send({ type: "SET_SELECTED_NODE", node }),
    setSelectedEdge: (edge: any) => send({ type: "SET_SELECTED_EDGE", edge }),
    setDragging: (isDragging: boolean) => send({ type: "SET_DRAGGING", isDragging }),
    resetFlow: () => send({ type: "RESET_FLOW" }),
  };
}
