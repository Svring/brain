import { useCoAgent } from "@copilotkit/react-core";
import { LanggraphState } from "@/contexts/langgraph/langgraph-machine";

export default function useLanggraphAgent<LanggraphState>() {
  const agent = useCoAgent({
    name: "ai",
    initialState: {
      base_url: "",
      api_key: "",
      model: "",
    },
  });

  return agent;
}
