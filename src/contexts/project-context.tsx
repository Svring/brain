"use client";

import { createContext, type ReactNode, useState, useEffect } from "react";
import useAI from "@/hooks/ai/use-ai";
import { useCoAgentStateRender } from "@copilotkit/react-core";
import { AIState } from "@/components/app/base/provider/ai-provider";

interface ProjectContextValue {
  projects: string[];
  activeProject: string | null;
  activeNode: any;
  setProjects: (projects: string[]) => void;
  setActiveProject: (activeProject: string | null) => void;
  setActiveNode: (activeNode: any) => void;
}

export const ProjectContext = createContext<ProjectContextValue>({
  projects: [],
  activeProject: null,
  activeNode: null,
  setProjects: () => {
    throw new Error("setProjects called outside ProjectProvider");
  },
  setActiveProject: () => {
    throw new Error("setActiveProject called outside ProjectProvider");
  },
  setActiveNode: () => {
    throw new Error("setActiveNode called outside ProjectProvider");
  },
});

export const ProjectProvider = ({
  children,
  initialActiveProject,
}: {
  children: ReactNode;
  initialActiveProject: string | null;
}) => {
  const [activeProject, setActiveProject] = useState<string | null>(
    initialActiveProject
  );
  const [projects, setProjects] = useState<string[]>([]);
  const [activeNode, setActiveNode] = useState<any>(null);

  const { setState } = useAI();

  useCoAgentStateRender<AIState>({
    name: "ai",
    render: ({ state }) => (
      <div style={{ fontSize: 12, fontFamily: "monospace", padding: 8 }}>
        <div>
          <strong>Model:</strong> {state.model}
        </div>
        <div>
          <strong>System Prompt:</strong> {state.system_prompt}
        </div>
        <div>
          <strong>Base URL:</strong> {state.base_url}
        </div>
        <div>
          <strong>API Key:</strong> {state.api_key ? "****" : "(none)"}
        </div>
        <div>
          <strong>Active Project:</strong>{" "}
          {state.project_context.activeProject ?? "(none)"}
        </div>
        <div>
          <strong>Projects:</strong>{" "}
          {state.project_context.projects.join(", ") || "(none)"}
        </div>
        <div>
          <strong>Active Node:</strong>{" "}
          {state.project_context.activeNode
            ? JSON.stringify(state.project_context.activeNode)
            : "(none)"}
        </div>
      </div>
    ),
  });

  // Update CoAgent state whenever project context changes
  useEffect(() => {
    setState((prevState) => {
      if (!prevState) {
        return {
          base_url: "",
          api_key: "",
          model: "",
          system_prompt: "",
          project_context: {
            projects,
            activeProject,
            activeNode,
          },
        };
      }
      return {
        ...prevState,
        project_context: {
          projects,
          activeProject,
          activeNode,
        },
      };
    });
  }, [projects, activeProject, activeNode]);

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        setActiveProject,
        projects,
        setProjects,
        activeNode,
        setActiveNode,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
