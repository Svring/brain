"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { listTemplatesOptions } from "@/lib/sealos/instance/instance-query";
import { InstanceApiContextSchema } from "@/lib/sealos/instance/schemas/instance-api-context-schemas";

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
