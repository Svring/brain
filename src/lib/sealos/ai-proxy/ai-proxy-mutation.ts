"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAiProxyToken } from "./ai-proxy-old-api";
import type { AiProxyApiContext } from "./schemas/ai-proxy-api-context";
import type { AiProxyCreateTokenRequest } from "./schemas/req-res-schemas/req-res-create-schemas";

export function useCreateAiProxyTokenMutation(context: AiProxyApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AiProxyCreateTokenRequest) =>
      createAiProxyToken(request, context),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "ai-proxy", "token", "list"],
      });
    },
  });
}
