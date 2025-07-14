"use client";

import { createContext, type ReactNode, useState, useEffect } from "react";
import useAI from "@/hooks/ai/use-ai";

interface ProjectContextValue {
  projects: string[];
  projectName: string | null;
  activeNode: any;
  setProjects: (projects: string[]) => void;
  setProjectName: (projectName: string | null) => void;
  setActiveNode: (activeNode: any) => void;
}

export const ProjectContext = createContext<ProjectContextValue>({
  projects: [],
  projectName: null,
  activeNode: null,
  setProjects: () => {
    throw new Error("setProjects called outside ProjectProvider");
  },
  setProjectName: () => {
    throw new Error("setProjectName called outside ProjectProvider");
  },
  setActiveNode: () => {
    throw new Error("setActiveNode called outside ProjectProvider");
  },
});

export const ProjectProvider = ({
  children,
  initialProjectName,
}: {
  children: ReactNode;
  initialProjectName: string | null;
}) => {
  const [projectName, setProjectName] = useState<string | null>(
    initialProjectName
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
            projectName,
            activeNode,
          },
        };
      }
      return {
        ...prevState,
        project_context: {
          projects,
          projectName,
          activeNode,
        },
      };
    });
  }, [projects, projectName, activeNode]);

  return (
    <ProjectContext.Provider
      value={{
        projectName,
        setProjectName,
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
