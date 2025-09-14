"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { BrainState } from "@/contexts/langgraph/langgraph-schema";

interface UseLanggraphStreamProps {
  threadId: string;
}

export function useLanggraphStream({ threadId }: UseLanggraphStreamProps) {
  const streamResult = useStream<BrainState>({
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL,
    assistantId: process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID || "orca",
    messagesKey: "messages",
    threadId: threadId || "",
  });

  return streamResult;
}
