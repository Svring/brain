import { activateDevboxActions } from "@/lib/copilot/sealos/devbox/copilot-devbox-actions";
import { activateClusterActions } from "@/lib/copilot/sealos/cluster/copilot-cluster-actions";
import { activateObjectStorageBucketActions } from "@/lib/copilot/sealos/objectstoragebucket/copilot-objectstoragebucket-actions";
import { activateLaunchpadActions } from "@/lib/copilot/sealos/launchpad/copilot-launchpad-actions";
import { activateProjectActions } from "@/lib/copilot/brain/project/copilot-project-actions";

export default function useCopilotActions() {
  // Activate actions based on the provided types
  activateDevboxActions();

  activateClusterActions();

  activateLaunchpadActions();

  activateObjectStorageBucketActions();

  activateProjectActions();
}
