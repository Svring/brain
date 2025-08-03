"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import type { AiState } from "@/contexts/ai/ai-machine";
import { useAiState } from "@/contexts/ai/ai-context";
import { StateCard } from "@/components/ai/headless/ai-state-card";
import { activateDevboxActions } from "@/lib/ai/sealos/devbox/ai-devbox-actions";
import { activateProjectActions } from "@/lib/ai/project/ai-project-actions";
import { activateAppActions } from "@/lib/ai/sealos/app/ai-app-actions";
import { activateObjectStorageBucketActions } from "@/lib/ai/sealos/objectstoragebucket/ai-objectstoragebucket-actions";
import { activateClusterActions } from "@/lib/ai/sealos/cluster/ai-cluster-actions";
import { activateGeneralActions } from "@/lib/ai/general/ai-general-actions";

import {
  createK8sContext,
  createDevboxContext,
  createSealosContext,
  createClusterContext,
} from "@/lib/auth/auth-utils";

export default function useAI() {
  const { aiState } = useAiState();

  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();
  const sealosContext = createSealosContext();
  const clusterContext = createClusterContext();

  // activateProjectActions(k8sContext);
  // activateDevboxActions(k8sContext, devboxContext);
  // activateAppActions(sealosContext, k8sContext);
  // activateObjectStorageBucketActions(k8sContext, sealosContext);
  // activateClusterActions(k8sContext, clusterContext);
  activateGeneralActions();

  useCoAgentStateRender<AiState>({
    name: "ai",
    render: ({ state }) => <StateCard state={state} />,
  });

  return useCoAgent<AiState>({
    name: "ai",
    initialState: aiState,
  });
}
