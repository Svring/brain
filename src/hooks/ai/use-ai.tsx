"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import type { AiState } from "@/contexts/ai/ai-machine";
import { useAiState } from "@/contexts/ai/ai-context";
import { StateCard } from "@/components/ai/headless/ai-state-card";
import { activateDevboxActions } from "@/lib/ai/sealos/devbox/ai-devbox-actions";
import { activateProjectActions } from "@/lib/ai/project/ai-project-actions";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { DevboxApiContext } from "@/lib/sealos/devbox/devbox-api/devbox-open-api-schemas";
import { createK8sContext, createDevboxContext } from "@/lib/auth/auth-utils";

export default function useAI() {
  const { aiState } = useAiState();

  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();

  activateProjectActions(k8sContext);
  activateDevboxActions(k8sContext, devboxContext);

  // useCoAgentStateRender<AiState>({
  //   name: "ai",
  //   render: ({ state }) => <StateCard state={state} />,
  // });

  return useCoAgent<AiState>({
    name: "ai",
    initialState: aiState,
  });
}
