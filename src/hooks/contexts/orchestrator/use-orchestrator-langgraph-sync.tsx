import { useEffect } from "react";
import { useLanggraphAgent } from "@/hooks/langgraph/use-langgraph-agent";
import { useLanggraphContext } from "@/contexts/langgraph/langgraph-context";

export const useOrchestratorLanggraphSync = () => {
  const { state: langgraphState } = useLanggraphContext();
  const { setState: setLanggraphState } = useLanggraphAgent();

  useEffect(() => {
    const { base_url, api_key, model_name } = langgraphState.context;
    if (base_url || api_key || model_name) {
      setLanggraphState(langgraphState.context);
    }
  }, [
    langgraphState.context.base_url,
    langgraphState.context.api_key,
    langgraphState.context.model_name,
  ]);

  // Sync stage changes with setLanggraphState
  useEffect(() => {
    const { stage } = langgraphState.context;
    if (stage) {
      setLanggraphState({ ...langgraphState.context, stage });
    }
  }, [langgraphState.context.stage]);
};
