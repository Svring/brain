"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { projectMachine } from "@/contexts/project-context/project-machine";
import { createBrowserInspector } from "@statelyai/inspect";
import useAI from "@/hooks/ai/use-ai";
import _ from "lodash";

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

  const { state: aiState, setState: setAIState } = useAI();

  useEffect(() => {
    setAIState({
      ...aiState,
      project_context: {
        ...aiState.project_context,
        homepageData: {
          ...aiState.project_context.homepageData,
          projects: state.context.homepageData.projects,
        },
        flowGraphData: {
          ...aiState.project_context.flowGraphData,
          project: state.context.flowGraphData.project,
          resources: state.context.flowGraphData.resources,
        },
      },
    });
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
