"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { InstanceApiContextSchema } from "@/lib/sealos/template/schemas/template-api-context-schemas";
import { listTemplatesOptions } from "@/lib/sealos/template/template-query";

export function useTemplates() {
  const { user } = use(AuthContext);

  // Create instance API context from user data
  const instanceContext = useMemo(() => {
    if (!(user?.regionUrl && user?.kubeconfig)) {
      return null;
    }
    return InstanceApiContextSchema.parse({
      baseURL: user.regionUrl,
      authorization: user.kubeconfig,
    });
  }, [user?.regionUrl, user?.kubeconfig]);

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
