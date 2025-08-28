import { useCoAgent } from "@copilotkit/react-core";
import { BrainState } from "@/contexts/langgraph/langgraph-schema";

export function useLanggraphAgent(stage: "propose_project" | "manage_project") {
  const agent = useCoAgent<BrainState>({
    name: "orca",
    initialState: {
      base_url: "http://localhost:8000",
      api_key: "orca",
      model: "orca-3-70b-instruct",
      project_context: {},
      stage: stage,
    },
  });

  return agent;
}
