"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { InstanceApiContextSchema } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { listTemplatesOptions } from "@/lib/sealos/template/template-method/template-query";

export function useProjectTemplates() {
  const { auth } = useAuthContext();

  // Create instance API context from auth data
  const instanceContext = useMemo(() => {
    if (!(auth?.regionUrl && auth?.kubeconfig)) {
      return null;
    }
    return InstanceApiContextSchema.parse({
      baseURL: auth.regionUrl,
      authorization: auth.kubeconfig,
    });
  }, [auth?.regionUrl, auth?.kubeconfig]);

  const queryOptions = instanceContext
    ? listTemplatesOptions(instanceContext)
    : {
        queryKey: ["sealos", "instance", "templates", "list", "disabled"],
        queryFn: () =>
          Promise.resolve({
            code: 200,
            message: "No context",
            data: { templates: [] },
          }),
      };

  return useQuery({
    ...queryOptions,
    enabled: !!instanceContext,
  });
}
