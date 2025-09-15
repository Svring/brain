import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useSealosContext } from "@/lib/auth/auth-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "./use-resource-status";
import _ from "lodash";

interface MetricsDataPoint {
  timestamp: number;
  readableTime: string;
  cpu: number;
  memory: number;
  storage?: number;
}

export const useResourceMetrics = (
  target: CustomResourceTarget | BuiltinResourceTarget
) => {
  const sealosContext = useSealosContext();
  const { devbox, cluster, launchpad } = useTRPCClients();

  // Get the resource using useResourceStatus
  const { resource } = useResourceStatus(target);

  // Fetch monitor data based on resource kind
  const { data: devboxMonitorData } = useQuery({
    ...devbox.monitor.queryOptions({
      devboxName: resource?.pods?.[0]?.name || "",
    }),
    enabled:
      target.resourceType?.toLowerCase() === "devbox" &&
      !!resource?.pods?.[0]?.name,
  });

  const { data: clusterMonitorData } = useQuery({
    ...cluster.combinedMonitor.queryOptions({
      dbName: target.name || "",
      dbType: target.type!,
    }),
    enabled: target.resourceType?.toLowerCase() === "cluster",
  });

  const { data: launchpadMonitorData } = useQuery({
    ...launchpad.monitor.queryOptions({
      queryName: resource?.pods?.[0]?.name || "",
    }),
    enabled:
      target.resourceType?.toLowerCase() === "deployment" ||
      target.resourceType?.toLowerCase() === "statefulset",
  });

  // Get the appropriate monitor data based on resource type
  const getMonitorData = (): MetricsDataPoint[] | undefined => {
    const resourceType = target.resourceType?.toLowerCase() || "";

    if (resourceType === "devbox") {
      return devboxMonitorData as MetricsDataPoint[] | undefined;
    } else if (resourceType === "cluster" && _.isObject(clusterMonitorData)) {
      // Extract the first key's value from cluster monitor data
      const firstKey = _.first(_.keys(clusterMonitorData));
      return firstKey
        ? (_.get(clusterMonitorData, firstKey) as
            | MetricsDataPoint[]
            | undefined)
        : undefined;
    } else if (_.includes(["deployment", "statefulset"], resourceType)) {
      return launchpadMonitorData as MetricsDataPoint[] | undefined;
    }

    return undefined;
  };

  const monitorData = getMonitorData();

  // Determine loading state
  const isLoading =
    (target.resourceType?.toLowerCase() === "devbox" && !devboxMonitorData) ||
    (target.resourceType?.toLowerCase() === "cluster" && !clusterMonitorData) ||
    (_.includes(
      ["deployment", "statefulset"],
      target.resourceType?.toLowerCase() || ""
    ) &&
      !launchpadMonitorData);

  return {
    monitorData,
    isLoading,
  };
};
