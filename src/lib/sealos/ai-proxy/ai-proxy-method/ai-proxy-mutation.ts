"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAiProxyToken } from "../ai-proxy-api/ai-proxy-old-api";
import { deleteAiProxyToken } from "../ai-proxy-api/ai-proxy-old-api";
import type { AiProxyApiContext } from "../schemas/ai-proxy-api-context";
import type { AiProxyCreateTokenRequest } from "../schemas/req-res-schemas/req-res-create-schemas";
import type { AiProxyDeleteTokenRequest } from "../schemas/req-res-schemas/req-res-delete-schemas";

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

export function useDeleteAiProxyTokenMutation(context: AiProxyApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AiProxyDeleteTokenRequest) =>
      deleteAiProxyToken(request, context),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "ai-proxy", "token", "list"],
      });
    },
  });
}
