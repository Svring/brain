import { activateDevboxActions } from "@/lib/copilot/sealos/devbox/copilot-devbox-actions";
import { activateClusterActions } from "@/lib/copilot/sealos/cluster/copilot-cluster-actions";
import { activateObjectStorageBucketActions } from "@/lib/copilot/sealos/objectstoragebucket/copilot-objectstoragebucket-actions";

import {
  createK8sContext,
  createDevboxContext,
  createSealosContext,
} from "@/lib/auth/auth-utils";

export default function useCopilotActions() {
  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();
  const sealosContext = createSealosContext();

  activateDevboxActions(k8sContext, devboxContext);
  activateClusterActions(k8sContext, sealosContext);
  activateObjectStorageBucketActions(k8sContext, sealosContext);
}
