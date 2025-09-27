"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface PodLogsOptions {
  container?: string;
  tailLines?: number;
  follow?: boolean;
  previous?: boolean;
  sinceSeconds?: number;
  timestamps?: boolean;
}

interface UsePodLogsOptions {
  podNames: string[];
  options?: PodLogsOptions;
  enabled?: boolean;
}

export const usePodLogs = ({
  podNames,
  options = {},
  enabled = true,
}: UsePodLogsOptions) => {
  const { k8s } = useTRPCClients();

  const {
    data: logsRecord,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...k8s.podLogs.queryOptions({ podNames, options }),
    enabled: enabled && podNames.length > 0,
  });

  return {
    logsRecord: logsRecord || {},
    isLoading,
    error,
    refetch,
    // Helper to get logs for a specific pod
    getPodLogs: (podName: string) =>
      logsRecord?.[podName] || { logs: "", success: false },
  };
};
