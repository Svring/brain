"use client";

import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { getDeploymentOptions } from "@/lib/sealos/deployment/deployment-method/deployment-query";

export default function useDeploymentNode(
  context: K8sApiContext,
  target: BuiltinResourceTarget
) {
  const { data, isLoading } = useQuery(getDeploymentOptions(context, target));

  if (isLoading) {
    return {
      isLoading: true,
      data: undefined,
    };
  }

  return {
    data,
    isLoading: false,
  };
}
