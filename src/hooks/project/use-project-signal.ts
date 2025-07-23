import { useEffect } from "react";
import { useProjectActions } from "@/contexts/project/project-context";

/**
 * Custom hook for handling project lifecycle signals
 * Automatically enters project on mount and exits on unmount
 * @param projectName The name of the project
 */
export function useProjectSignal(projectName: string) {
  const { enterProject, exitProject } = useProjectActions();

  useEffect(() => {
    enterProject();
    return () => {
      exitProject();
    };
  }, [projectName]);
}
