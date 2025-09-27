"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface UsePodsOptions {
  target: ResourceTarget;
  enabled?: boolean;
}

export const usePods = ({ target, enabled = true }: UsePodsOptions) => {
  const { k8s } = useTRPCClients();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...k8s.pods.queryOptions({ target }),
    enabled: enabled && !!target.name,
  });

  // console.log("data", data);

  // Transform raw pod data to expected format
  const transformedPods = (data?.pods || []).map((pod: any) => ({
    name: pod.metadata?.name || "unknown",
    createdAt: pod.metadata?.creationTimestamp || null,
    ports: pod.spec?.containers?.flatMap((container: any) => 
      container.ports?.map((port: any) => ({
        name: port.name || "unnamed",
        containerPort: port.containerPort,
        protocol: port.protocol || "TCP",
        containerName: container.name,
      })) || []
    ) || [],
    resources: pod.spec?.containers?.map((container: any) => ({
      containerName: container.name,
      requests: container.resources?.requests || {},
      limits: container.resources?.limits || {},
    })) || [],
    containerStatuses: pod.status?.containerStatuses?.map((status: any) => ({
      name: status.name,
      ready: status.ready,
      restartCount: status.restartCount,
      started: status.started,
      state: status.state,
      lastState: status.lastState,
      containerID: status.containerID,
      image: status.image,
      imageID: status.imageID,
    })) || [],
  })).filter((pod: any) => pod.name !== "unknown");

  return {
    pods: transformedPods,
    success: data?.success || false,
    error: error,
    isLoading,
    refetch,
  };
};