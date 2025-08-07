"use client";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import _ from "lodash";
import { useEffect } from "react";
import { useMount } from "@reactuses/core";
import type { AiState } from "@/contexts/ai/ai-machine";
import { useAiState, useAiActions } from "@/contexts/ai/ai-context";
import { StateCard } from "@/components/ai/headless/ai-state-card";
import { activateAppActions } from "@/lib/ai/brain/app/ai-app-actions";
import { activateDevboxActions } from "@/lib/ai/sealos/devbox/ai-devbox-actions";
import { activateProjectActions } from "@/lib/ai/project/ai-project-actions";
import { activateObjectStorageBucketActions } from "@/lib/ai/sealos/objectstoragebucket/ai-objectstoragebucket-actions";
import { activateClusterActions } from "@/lib/ai/sealos/cluster/ai-cluster-actions";
import { activateGeneralActions } from "@/lib/ai/general/ai-general-actions";
import { activateInterruptActions } from "@/lib/ai/general/ai-interrupt-actions";

import {
  createK8sContext,
  createDevboxContext,
  createSealosContext,
  createClusterContext,
} from "@/lib/auth/auth-utils";

export default function useAI() {
  const { aiState } = useAiState();
  const { setState } = useAiActions();

  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();
  const sealosContext = createSealosContext();
  const clusterContext = createClusterContext();

  // activateProjectActions(k8sContext);
  // activateDevboxActions(k8sContext, devboxContext);
  activateAppActions();
  // activateObjectStorageBucketActions(k8sContext, sealosContext);
  // activateClusterActions(k8sContext, clusterContext);
  activateGeneralActions();
  // activateInterruptActions();

  // useCoAgentStateRender<AiState>({
  //   name: "ai",
  //   render: ({ state }) => <StateCard state={state} />,
  // });

  const agent = useCoAgent<AiState>({
    name: "ai",
    initialState: aiState,
  });

  return agent;
}
