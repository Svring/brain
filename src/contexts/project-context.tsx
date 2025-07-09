"use client";

import { createContext, type ReactNode, useState } from "react";

interface ProjectContextValue {
  projectName: string | null;
  setProjectName: (projectName: string | null) => void;
}

export const ProjectContext = createContext<ProjectContextValue>({
  projectName: null,
  setProjectName: () => {
    throw new Error("setProjectName called outside ProjectProvider");
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
  return (
    <ProjectContext.Provider value={{ projectName, setProjectName }}>
      {children}
    </ProjectContext.Provider>
  );
};
