"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { useEffect, createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { orchestratorMachine } from "@/contexts/orchestrator/orchestrator-machine";
import { useProjectContext } from "@/contexts/project/project-context";
import { useFlowgraphContext } from "@/contexts/flowgraph/flowgraph-context";

// const inspector = createBrowserInspector();

interface OrchestratorContextValue {
  state: StateFrom<typeof orchestratorMachine>;
  send: (event: EventFrom<typeof orchestratorMachine>) => void;
  actorRef: ActorRefFrom<typeof orchestratorMachine>;
}

export const OrchestratorContext =
  createContext<OrchestratorContextValue | undefined>(undefined);

export const OrchestratorProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, send, actorRef] = useMachine(orchestratorMachine, {
    // inspect: inspector.inspect,
  });

  const {
    state: projectState,
  } = useProjectContext();
  const {
    state: flowState,
  } = useFlowgraphContext();

  useEffect(() => {
    send({
      type: "PROJECT_UPDATED",
      project: {
        totalProjects: projectState.context.allProjects.length,
        selectedProject: projectState.context.selectedProject,
        selectedProjectResources: projectState.context.selectedProjectResources,
      },
    });
  }, [projectState.context.allProjects, projectState.context.selectedProject, projectState.context.selectedProjectResources, send]);

  useEffect(() => {
    send({
      type: "FLOWGRAPH_UPDATED",
      flowgraph: {
        nodeCount: flowState.context.nodes.length,
        edgeCount: flowState.context.edges.length,
        selectedNode: flowState.context.selectedNode,
        selectedEdge: flowState.context.selectedEdge,
      },
    });
  }, [flowState.context.nodes, flowState.context.edges, flowState.context.selectedNode, flowState.context.selectedEdge, send]);

  return (
    <OrchestratorContext.Provider value={{ state, send, actorRef }}>
      {children}
    </OrchestratorContext.Provider>
  );
};

export function useOrchestratorContext() {
  const ctx = useContext(OrchestratorContext);
  if (!ctx)
    throw new Error(
      "useOrchestratorContext must be used within OrchestratorProvider"
    );
  return ctx;
}

export function useOrchestratorState() {
  const { state } = useOrchestratorContext();
  return {
    project: state.context.project,
    flowgraph: state.context.flowgraph,
  };
}


