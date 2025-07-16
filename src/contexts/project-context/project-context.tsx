"use client";

import { createContext, type ReactNode, useContext } from "react";
import { useMachine } from "@xstate/react";
import { projectMachine } from "@/contexts/project-context/project-machine";
import { createBrowserInspector } from "@statelyai/inspect";

const inspector = createBrowserInspector();

interface ProjectContextValue {
  state: any;
  send: any;
  actorRef: any;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [state, send, actorRef] = useMachine(projectMachine, {
    inspect: inspector.inspect,
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
