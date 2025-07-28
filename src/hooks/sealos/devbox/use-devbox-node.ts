"use client";

import { useQuery } from "@tanstack/react-query";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { getDevboxOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";

const useDevboxNode = (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  const { data, isLoading } = useQuery(getDevboxOptions(context, target));

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
};

export default useDevboxNode;
