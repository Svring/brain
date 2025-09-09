import { activateDevboxActions } from "@/lib/copilot/sealos/devbox/copilot-devbox-actions";
import { activateClusterActions } from "@/lib/copilot/sealos/cluster/copilot-cluster-actions";
import { activateObjectStorageBucketActions } from "@/lib/copilot/sealos/objectstoragebucket/copilot-objectstoragebucket-actions";
import { activateLaunchpadActions } from "@/lib/copilot/sealos/launchpad/copilot-launchpad-actions";
import { activateProjectActions } from "@/lib/copilot/brain/project/copilot-project-actions";

import {
  createK8sContext,
  useDevboxContext,
  useSealosContext,
} from "@/lib/auth/auth-utils";

export default function useCopilotActions() {
  const k8sContext = createK8sContext();
  const sealosContext = useSealosContext();

  // Activate actions based on the provided types
  activateDevboxActions();

  // activateClusterActions(k8sContext, sealosContext);

  activateLaunchpadActions(sealosContext, k8sContext);

  // activateObjectStorageBucketActions(k8sContext, sealosContext);

  activateProjectActions(k8sContext, sealosContext);
}
