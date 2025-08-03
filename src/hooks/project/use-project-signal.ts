import { useEffect } from "react";
import { useProjectActions } from "@/contexts/project/project-context";
import { useCopilotChat } from "@copilotkit/react-core";
import { randomId } from "@copilotkit/shared";

/**
 * Custom hook for handling project lifecycle signals
 * Automatically enters project on mount and exits on unmount
 * @param projectName The name of the project
 */
export function useProjectSignal(projectName: string) {
  const { enterProject, exitProject } = useProjectActions();

  const { appendMessage } = useCopilotChat();

  useEffect(() => {
    enterProject();
    appendMessage({
      id: randomId(),
      role: "system",
      content: `system event: the user has entered the ${projectName} project`,
    });
    return () => {
      exitProject();
      appendMessage({
        id: randomId(),
        role: "system",
        content: `system event: the user has exited the ${projectName} project`,
      });
    };
  }, [projectName]);
}
