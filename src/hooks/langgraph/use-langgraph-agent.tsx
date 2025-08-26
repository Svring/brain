import { useCoAgent } from "@copilotkit/react-core";
import { BrainState } from "@/contexts/langgraph/langgraph-schema";

export function useLanggraphAgent(stage: "propose_project" | "manage_project") {
  const agent = useCoAgent<BrainState>({
    name: "orca",
    initialState: {
      stage: stage,
    },
  });

  return agent;
}
