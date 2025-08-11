"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { projectMachine } from "@/contexts/project/project-machine";

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


