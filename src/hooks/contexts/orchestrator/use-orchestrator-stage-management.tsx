import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProjectState } from "@/contexts/project/project-context";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import { useLanggraphContext } from "@/contexts/langgraph/langgraph-context";

export const useOrchestratorStageManagement = () => {
  const pathname = usePathname();
  const { selectedProject } = useProjectState();
  const { state: langgraphState } = useLanggraphContext();
  const { setState: setLanggraphState } = useLanggraphAgent();

  useEffect(() => {
    const stage = pathname === "/home" ? "propose_project" : "manage_project";
    setLanggraphState({ ...langgraphState.context, stage });
  }, [pathname, langgraphState.context.stage]);
};
