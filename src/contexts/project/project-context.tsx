"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import {
  projectMachine,
  type ResourceObject,
} from "@/contexts/project/project-machine";
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
  const { send, state } = useProjectContext();
  const { state: langgraphState, setState: setLanggraphState } =
    useLanggraphAgent("manage_project");

  const syncStateToLanggraph = () => {
    const newState = _.cloneDeep(langgraphState);
    _.set(newState, "resource_context.allProjects", state.context.allProjects);
    _.set(
      newState,
      "resource_context.selectedProject",
      state.context.selectedProject
    );
    _.set(
      newState,
      "resource_context.selectedProjectResources",
      state.context.selectedProjectResources
    );
    setLanggraphState(newState);
  };

  return {
    setAllProjects: (projects: unknown[]) => {
      send({ type: "SET_ALL_PROJECTS", projects });
      syncStateToLanggraph();
    },
    selectProject: (project: unknown) => {
      send({ type: "SELECT_PROJECT", project });
      syncStateToLanggraph();
    },
    clearSelectedProject: () => {
      send({ type: "CLEAR_SELECTED_PROJECT" });
      syncStateToLanggraph();
    },
    setSelectedProjectResources: (resources: ResourceObject[]) => {
      send({ type: "SET_SELECTED_PROJECT_RESOURCES", resources });
      syncStateToLanggraph();
    },
    clearSelectedProjectResources: () => {
      send({ type: "CLEAR_SELECTED_PROJECT_RESOURCES" });
      syncStateToLanggraph();
    },
    updateResource: (resource: ResourceObject) => {
      send({ type: "UPDATE_RESOURCE", resource });
      syncStateToLanggraph();
    },
    removeResource: (name: string, kind: string) => {
      send({ type: "REMOVE_RESOURCE", name, kind });
      syncStateToLanggraph();
    },
  };
}

// Export the ResourceObject type for use in other files
export type { ResourceObject };
