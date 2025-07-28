"use client";

import { useQuery } from "@tanstack/react-query";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
import { getObjectStorageOptions } from "@/lib/sealos/objectstorage/objectstorage-method/objectstorage-query";

export default function useObjectStorageNode(
  context: K8sApiContext,
  target: CustomResourceTarget
) {
  const { data, isLoading } = useQuery(
    getObjectStorageOptions(context, target)
  );

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
