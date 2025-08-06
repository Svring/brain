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

  useEffect(() => {
    const newState = _.cloneDeep(aiState);
    _.set(
      newState,
      "project_context.homepageData.projects",
      state.context.homepageData.projects
    );
    _.set(
      newState,
      "project_context.flowGraphData.project",
      state.context.flowGraphData.project
    );
    const resources = state.context.flowGraphData.resources;
    if (resources) {
      _.set(newState, "project_context.flowGraphData.resources", [
        ...resources.builtin,
        ...resources.custom,
      ]);
    }
    setAIState(newState);
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
    homepageData: state.context.homepageData,
    flowGraphData: state.context.flowGraphData,
    isOnHomepage: state.matches("homepage"),
    isOnFlowGraph: state.matches("flowGraph"),
  };
}

export function useProjectActions() {
  const { send } = useProjectContext();
  // const { appendMessage } = useCopilotChat();

  return {
    enterProject: () => {
      send({ type: "ENTER_PROJECT" });
      // appendMessage({
      //   id: randomId(),
      //   role: "system",
      //   content: `system event: the user has entered the project`,
      // });
    },
    exitProject: () => send({ type: "EXIT_PROJECT" }),
    setHomepageData: (projects: any) =>
      send({ type: "SET_HOMEPAGE_DATA", projects }),
    setFlowGraphData: (project: any, resources: any) =>
      send({ type: "SET_FLOW_GRAPH_DATA", project, resources }),
  };
}
