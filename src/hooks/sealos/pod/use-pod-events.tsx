"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface UsePodEventsOptions {
  podTargets: BuiltinResourceTarget[];
  enabled?: boolean;
}

export const usePodEvents = ({
  podTargets,
  enabled = true,
}: UsePodEventsOptions) => {
  const { k8s } = useTRPCClients();

  const {
    data: eventsRecord,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...k8s.podEvents.queryOptions({ podTargets }),
    enabled: enabled && podTargets.length > 0,
  });

  // Process events to retain only the required fields and simplify structure
  const processedEventsRecord = eventsRecord
    ? Object.fromEntries(
        Object.entries(eventsRecord).map(([podName, podData]) => [
          podName,
          podData.events?.map((event: any) => ({
            name: event.metadata?.name || "unknown",
            reason: event.reason || "",
            type: event.type || "",
            message: event.message || "",
            firstTimestamp: event.firstTimestamp || "",
            lastTimestamp: event.lastTimestamp || "",
            count: event.count || 0,
          })) || [],
        ])
      )
    : {};

  return {
    eventsRecord: processedEventsRecord,
    isLoading,
    error,
    refetch,
    // Helper to get events for a specific pod
    getPodEvents: (podName: string) => processedEventsRecord?.[podName] || [],
  };
};
