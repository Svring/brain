"use client";

import { queryOptions } from "@tanstack/react-query";
import { getAiProxyTokens } from "./ai-proxy-old-api";
import type { AiProxyApiContext } from "./schemas/ai-proxy-api-context";
import type { AiProxyTokenListResponse } from "./schemas/req-res-schemas/req-res-list-schemas";
import { runParallelAction } from "next-server-actions-parallel";

export const listAiProxyTokensOptions = (context: AiProxyApiContext) =>
  queryOptions({
    queryKey: ["sealos", "ai-proxy", "token", "list"],
    queryFn: () => runParallelAction(getAiProxyTokens(context)),
  });
