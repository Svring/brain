"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { projectMachine } from "@/contexts/project/project-machine";
import { useEffect } from "react";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import _ from "lodash";

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

  const { state: langgraphState, setState: setLanggraphState } =
    useLanggraphAgent();

  useEffect(() => {
    const newState = _.cloneDeep(langgraphState);
    _.set(newState, "project_context.allProjects", state.context.allProjects);
    _.set(newState, "project_context.selectedProject", state.context.selectedProject);
    _.set(newState, "project_context.selectedProjectResources", state.context.selectedProjectResources);
    setLanggraphState(newState);
  }, [state]);

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
  };
}

export function useProjectActions() {
  const { send } = useProjectContext();

  return {
    setAllProjects: (projects: unknown[]) =>
      send({ type: "SET_ALL_PROJECTS", projects }),
    selectProject: (project: unknown) =>
      send({ type: "SELECT_PROJECT", project }),
    clearSelectedProject: () => send({ type: "CLEAR_SELECTED_PROJECT" }),
    setSelectedProjectResources: (resources: unknown) =>
      send({ type: "SET_SELECTED_PROJECT_RESOURCES", resources }),
    clearSelectedProjectResources: () =>
      send({ type: "CLEAR_SELECTED_PROJECT_RESOURCES" }),
  };
}
