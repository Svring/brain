import { activateDevboxActions } from "@/lib/copilot/sealos/devbox/copilot-devbox-actions";
import { activateClusterActions } from "@/lib/copilot/sealos/cluster/copilot-cluster-actions";
import { activateObjectStorageBucketActions } from "@/lib/copilot/sealos/objectstoragebucket/copilot-objectstoragebucket-actions";
import { activateLaunchpadActions } from "@/lib/copilot/sealos/launchpad/copilot-launchpad-actions";
import { activateProjectActions } from "@/lib/copilot/brain/project/copilot-project-actions";

import {
  createK8sContext,
  createDevboxContext,
  createSealosContext,
} from "@/lib/auth/auth-utils";

export type ActionType =
  | "devbox"
  | "cluster"
  | "launchpad"
  | "objectstoragebucket"
  | "project";

export default function useCopilotActions(actionTypes?: ActionType[]) {
  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();
  const sealosContext = createSealosContext();

  // If no action types specified, activate all actions (default behavior)
  const actionsToActivate = actionTypes || [
    "devbox",
    "cluster",
    "launchpad",
    "objectstoragebucket",
    "project",
  ];

  // Activate actions based on the provided types
  if (actionsToActivate.includes("devbox")) {
    activateDevboxActions(k8sContext, devboxContext);
  }

  if (actionsToActivate.includes("cluster")) {
    activateClusterActions(k8sContext, sealosContext);
  }

  if (actionsToActivate.includes("launchpad")) {
    activateLaunchpadActions(sealosContext, k8sContext);
  }

  if (actionsToActivate.includes("objectstoragebucket")) {
    activateObjectStorageBucketActions(k8sContext, sealosContext);
  }

  if (actionsToActivate.includes("project")) {
    activateProjectActions(k8sContext);
  }
}
