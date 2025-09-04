"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import {
  projectMachine,
  type ResourceObject,
} from "@/contexts/project/project-machine";
import _ from "lodash";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  useLanggraphActions,
  useLanggraphState,
} from "@/contexts/langgraph/langgraph-context";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";

// const inspector = createBrowserInspector();

interface ProjectContextValue {
  state: StateFrom<typeof projectMachine>;
  send: (event: EventFrom<typeof projectMachine>) => void;
  actorRef: ActorRefFrom<typeof projectMachine>;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [state, send, actorRef] = useMachine(projectMachine, {
    // inspect: inspector.inspect,
  });

  return (
    <ProjectContext.Provider value={{ state, send, actorRef }}>
      {children}
    </ProjectContext.Provider>
  );
};

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx)
    throw new Error("useProjectContext must be used within ProjectProvider");
  return ctx;
}

export function useProjectState() {
  const { state } = useProjectContext();
  return {
    allProjects: state.context.allProjects,
    selectedProject: state.context.selectedProject,
    selectedProjectResources: state.context.selectedProjectResources,
    selectedResource: state.context.selectedResource,
  };
}

export function useProjectActions() {
  const { send, state } = useProjectContext();
  const { setProjectContext } = useLanggraphActions();
  const { state: agentState, setState: setAgentState } = useLanggraphAgent();

  return {
    setAllProjects: (projects: unknown[]) => {
      send({ type: "SET_ALL_PROJECTS", projects });
    },
    selectProject: (project: string) => {
      send({ type: "SELECT_PROJECT", project });
      setAgentState({
        ...agentState,
        project_context: {
          ...agentState.project_context,
          selectedProject: project,
        },
      });
    },
    clearSelectedProject: () => {
      send({ type: "CLEAR_SELECTED_PROJECT" });
      setAgentState({
        ...agentState,
        project_context: {
          ...agentState.project_context,
          selectedProject: null,
        },
      });
    },
    setSelectedProjectResources: (resources: any[]) => {
      send({ type: "SET_SELECTED_PROJECT_RESOURCES", resources });
      setProjectContext({
        ...state.context,
        selectedProjectResources: resources,
      });
      setAgentState({
        ...agentState,
        project_context: {
          ...agentState.project_context,
          selectedProjectResources: resources,
        },
      });
    },
    clearSelectedProjectResources: () => {
      send({ type: "CLEAR_SELECTED_PROJECT_RESOURCES" });
      setAgentState({
        ...agentState,
        project_context: {
          ...agentState.project_context,
          selectedProjectResources: null,
        },
      });
    },
    updateResource: (resource: ResourceObject) => {
      send({ type: "UPDATE_RESOURCE", resource });
    },
    removeResource: (name: string, kind: string) => {
      send({ type: "REMOVE_RESOURCE", name, kind });
    },
    selectResource: (target: ResourceTarget) => {
      send({ type: "SELECT_RESOURCE", target });
      setProjectContext({
        ...state.context,
        selectedResource: target,
      });
      setAgentState({
        ...agentState,
        project_context: {
          ...agentState.project_context,
          selectedResource: target,
        },
      });
    },
    clearSelectedResource: () => {
      send({ type: "CLEAR_SELECTED_RESOURCE" });
      setProjectContext({
        ...state.context,
        selectedResource: null,
      });
      setAgentState({
        ...agentState,
        project_context: {
          ...agentState.project_context,
          selectedResource: null,
        },
      });
    },
  };
}

// Export the ResourceObject type for use in other files
export type { ResourceObject };
