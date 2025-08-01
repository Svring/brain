"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import type { AiState } from "@/contexts/ai/ai-machine";
import { useAiState } from "@/contexts/ai/ai-context";
import { StateCard } from "@/components/ai/headless/ai-state-card";
// import { activateDevboxActions } from "@/lib/ai/sealos/devbox/ai-devbox-action";
import { activateProjectActions } from "@/lib/ai/project/ai-project-actions";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";

export default function useAI(context: K8sApiContext) {
  const { aiState } = useAiState();

  // activateDevboxActions();
  activateProjectActions(context);

  // useCoAgentStateRender<AiState>({
  //   name: "ai",
  //   render: ({ state }) => <StateCard state={state} />,
  // });

  return useCoAgent<AiState>({
    name: "ai",
    initialState: aiState,
  });
}
