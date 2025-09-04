import { useCoAgent } from "@copilotkit/react-core";
import { BrainState } from "@/contexts/langgraph/langgraph-schema";

export function useLanggraphAgent() {
  const agent = useCoAgent<BrainState>({
    name: "orca",
  });

  return agent;
}
