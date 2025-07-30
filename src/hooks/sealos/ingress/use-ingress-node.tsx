"use client";

import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { getIngressOptions } from "@/lib/sealos/ingress/ingress-method/ingress-query";

export default function useIngressNode(
  context: K8sApiContext,
  target: BuiltinResourceTarget
) {
  const { data, isLoading } = useQuery(getIngressOptions(context, target));

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
