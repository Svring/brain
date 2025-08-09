"use client";

import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import _ from "lodash";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { projectMachine } from "./project-machine";
import useAI from "@/hooks/ai/use-ai";
import { useCopilotChat } from "@copilotkit/react-core";
import { randomId } from "@copilotkit/shared";

// const inspector = createBrowserInspector();

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
    // inspect: inspector.inspect,
  });

  const { state: aiState, setState: setAIState } = useAI();

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
  return {};
}

export function useProjectActions() {
  const { send } = useProjectContext();

  return {
    enterProject: () => send({ type: "ENTER_PROJECT" }),
    exitProject: () => send({ type: "EXIT_PROJECT" }),
  };
}
