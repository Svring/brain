"use client";

import { createContext, type ReactNode, useState, useEffect } from "react";
import useAI from "@/hooks/ai/use-ai";

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
