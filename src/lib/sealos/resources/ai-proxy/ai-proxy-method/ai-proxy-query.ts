"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { getAiProxyTokens } from "../ai-proxy-api/ai-proxy-old-api";
import type { AiProxyApiContext } from "../schemas/ai-proxy-api-context";

export const listAiProxyTokensOptions = (context: AiProxyApiContext) =>
	queryOptions({
		queryKey: ["sealos", "ai-proxy", "token", "list"],
		queryFn: () => runParallelAction(getAiProxyTokens(context)),
	});
