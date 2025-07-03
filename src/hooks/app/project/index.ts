"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { listProjectOptions } from "@/lib/app/project/project-query";
import type { ProjectResources } from "@/lib/app/project/schemas";
import type { K8sApiContext } from "@/lib/k8s/schemas";

export function useProjects(): UseQueryResult<ProjectResources, Error> {
  const { user } = use(AuthContext);

  const context: K8sApiContext | null =
    user?.namespace && user?.kubeconfig
      ? {
          namespace: user.namespace,
          kubeconfig: decodeURIComponent(user.kubeconfig),
        }
      : null;

  return useQuery({
    ...(context
      ? listProjectOptions(context)
      : {
          queryKey: ["project", "list", "disabled"],
          queryFn: () => Promise.resolve({}),
        }),
    enabled: !!context,
  });
}
