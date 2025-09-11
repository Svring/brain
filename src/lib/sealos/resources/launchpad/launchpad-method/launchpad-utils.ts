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

/**
 * Parses launchpad log data and extracts unique container names as log file names
 * @param logData - Array of launchpad log entries containing container and pod information
 * @returns Array of unique container names from the log data
 */
export const parseLaunchpadLogFiles = (logData: any[]): string[] => {
  try {
    if (!Array.isArray(logData)) {
      return [];
    }

    const containerNames = new Set<string>();

    logData.forEach((logEntry) => {
      if (logEntry?.container && typeof logEntry.container === "string") {
        containerNames.add(logEntry.container);
      }
    });

    return Array.from(containerNames);
  } catch (error) {
    console.error("Error parsing launchpad log files:", error);
    return [];
  }
};
