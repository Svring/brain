"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import type { AiState } from "@/contexts/ai/ai-machine";
import { useAiState } from "@/contexts/ai/ai-context";
import { StateCard } from "@/components/ai/headless/ai-state-card";
// import { activateDevboxActions } from "@/lib/ai/sealos/devbox/ai-devbox-action";

export default function useAI() {
  const { aiState } = useAiState();

  // activateDevboxActions();

  useCoAgentStateRender<AiState>({
    name: "ai",
    render: ({ state }) => <StateCard state={state} />,
  });

  return useCoAgent<AiState>({
    name: "ai",
    initialState: aiState,
  });
}
