"use client";

import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { getStatefulSetOptions } from "@/lib/sealos/statefulset/statefulset-method/statefulset-query";

export default function useStatefulSetNode(
  context: K8sApiContext,
  target: BuiltinResourceTarget
) {
  const { data, isLoading } = useQuery(getStatefulSetOptions(context, target));

  if (isLoading) {
    return {
      isLoading: true,
      data: undefined,
    };
  }

  return {
    data,
    isLoading,
  };
}
