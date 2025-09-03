import { useCoAgent } from "@copilotkit/react-core";
import { BrainState } from "@/contexts/langgraph/langgraph-schema";
import { useAuthState } from "@/contexts/auth/auth-context";

export function useLanggraphAgent(stage: "propose_project" | "manage_project") {
  const { auth } = useAuthState();
  const agent = useCoAgent<BrainState>({
    name: "orca",
    initialState: {
      // base_url: auth?.regionUrl ?? "http://localhost:8000",
      // api_key: auth?.appToken ?? "orca",
      // model_name: "orca-3-70b-instruct",
      // project_context: {},
      stage: stage,
    },
  });

  return agent;
}
