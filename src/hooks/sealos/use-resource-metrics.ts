import { useQuery } from "@tanstack/react-query";
import {
  devboxClient,
  clusterClient,
  launchpadClient,
} from "@/components/provider/trpc-provider";
import { createSealosContext } from "@/lib/auth/auth-utils";
import _ from "lodash";

interface MetricsDataPoint {
  timestamp: number;
  readableTime: string;
  cpu: number;
  memory: number;
  storage?: number;
}

interface Resource {
  name: string;
  kind: string;
  type?: string;
  pods?: Array<{ name: string }>;
}

export const useResourceMetrics = (resource: Resource) => {
  const sealosContext = createSealosContext();
  const devboxTrpcClient = devboxClient.useTRPC();
  const clusterTrpcClient = clusterClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();

  // Fetch monitor data based on resource kind
  const { data: devboxMonitorData } = useQuery({
    ...devboxTrpcClient.getDevboxCombinedMonitorData.queryOptions({
      devboxName: resource.pods?.[0]?.name || "",
    }),
    enabled:
      resource.kind.toLowerCase() === "devbox" && !!resource.pods?.[0]?.name,
  });

  const { data: clusterMonitorData } = useQuery({
    ...clusterTrpcClient.getClusterCombinedMonitorData.queryOptions({
      dbName: resource.name,
      dbType: resource.type!,
    }),
    enabled: resource.kind.toLowerCase() === "cluster",
  });

  const { data: launchpadMonitorData } = useQuery({
    ...launchpadTrpcClient.getLaunchpadCombinedMonitorData.queryOptions({
      context: sealosContext,
      queryName: resource.pods?.[0]?.name || "",
    }),
    enabled:
      resource.kind.toLowerCase() === "deployment" ||
      resource.kind.toLowerCase() === "statefulset",
  });

  // Get the appropriate monitor data based on resource kind
  const getMonitorData = (): MetricsDataPoint[] | undefined => {
    const kind = resource.kind.toLowerCase();

    if (kind === "devbox") {
      return devboxMonitorData as MetricsDataPoint[] | undefined;
    } else if (kind === "cluster" && _.isObject(clusterMonitorData)) {
      // Extract the first key's value from cluster monitor data
      const firstKey = _.first(_.keys(clusterMonitorData));
      return firstKey
        ? (_.get(clusterMonitorData, firstKey) as
            | MetricsDataPoint[]
            | undefined)
        : undefined;
    } else if (_.includes(["deployment", "statefulset"], kind)) {
      return launchpadMonitorData as MetricsDataPoint[] | undefined;
    }

    return undefined;
  };

  const monitorData = getMonitorData();

  // Determine loading state
  const isLoading =
    (resource.kind.toLowerCase() === "devbox" && !devboxMonitorData) ||
    (resource.kind.toLowerCase() === "cluster" && !clusterMonitorData) ||
    (_.includes(["deployment", "statefulset"], resource.kind.toLowerCase()) &&
      !launchpadMonitorData);

  return {
    monitorData,
    isLoading,
  };
};
