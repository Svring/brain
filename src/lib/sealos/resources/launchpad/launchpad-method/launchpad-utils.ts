interface LaunchpadStatus {
  paused?: boolean;
  replicas?: number;
  unavailableReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
}

/**
 * Determines the status of a launchpad resource (deployment or statefulset)
 * based on its status object, using the same logic as the deployment node.
 */
export const determineLaunchpadStatus = (
  status: LaunchpadStatus | undefined
): string => {
  if (!status) return "Pending";

  if (status.paused) {
    return "Stopped";
  }

  if (
    status.unavailableReplicas !== undefined &&
    status.unavailableReplicas > 0
  ) {
    return "Pending";
  }

  if (status.readyReplicas === status.replicas) {
    return "Running";
  }

  return "Pending";
};
