import { activateDevboxActions } from "@/lib/copilot/sealos/devbox/ai-devbox-actions";
import { activateClusterActions } from "@/lib/copilot/sealos/cluster/ai-cluster-actions";

import {
  createK8sContext,
  createDevboxContext,
  createSealosContext,
  createClusterContext,
} from "@/lib/auth/auth-utils";

export default function useCopilotActions() {
  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();
  const sealosContext = createSealosContext();
  const clusterContext = createClusterContext();

  activateDevboxActions(k8sContext, devboxContext);
  activateClusterActions(k8sContext, sealosContext);
}
