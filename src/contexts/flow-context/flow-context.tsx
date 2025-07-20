"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import { flowMachine } from "@/contexts/flow-context/flow-machine";
import type { Edge, Node } from "@xyflow/react";

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

  return (
    <FlowContext.Provider value={{ state, send, actorRef }}>
      {children}
    </FlowContext.Provider>
  );
};

export function useFlowContext() {
  const ctx = useContext(FlowContext);
  if (!ctx)
    throw new Error("useFlowContext must be used within FlowProvider");
  return ctx;
}

export function useFlowState() {
  const { state } = useFlowContext();
  return {
    nodes: state.context.nodes as Node[],
    edges: state.context.edges as Edge[],
    isInitialized: state.context.isInitialized as boolean,
    isReady: state.matches("ready"),
  };
}

export function useFlowActions() {
  const { send } = useFlowContext();
  
  return {
    setFlowData: (nodes: Node[], edges: Edge[]) =>
      send({ type: "SET_FLOW_DATA", nodes, edges }),
    updateNodes: (nodes: Node[]) =>
      send({ type: "UPDATE_NODES", nodes }),
    updateEdges: (edges: Edge[]) =>
      send({ type: "UPDATE_EDGES", edges }),
    resetFlow: () =>
      send({ type: "RESET_FLOW" }),
  };
}