"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import type { AiState } from "@/contexts/ai-context/ai-machine";
import { useAiContext } from "@/contexts/ai-context/ai-context";
import { StateCard } from "@/components/ai/state-card";
import { activateDevboxActions } from "@/lib/ai/sealos/devbox/ai-devbox-action";

export default function useAI() {
  const { aiState } = useAiContext();

  activateDevboxActions();

  useCoAgentStateRender<AiState>({
    name: "ai",
    render: ({ state }) => <StateCard state={state} />,
  });

  return useCoAgent<AiState>({
    name: "ai",
    initialState: aiState,
  });
}
