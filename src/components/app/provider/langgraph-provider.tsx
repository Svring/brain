"use client";

import { Client } from "@langchain/langgraph-sdk";
import { useAiState } from "@/contexts/ai/ai-context";
import { useAiActions } from "@/contexts/ai/ai-context";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useMount } from "@reactuses/core";

export default function LanggraphProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    aiState: { base_url, api_key, model },
    floatingChat: { graphId, assistantId, threadId },
  } = useAiState();

  const { setAssistantId, setThreadId } = useAiActions();

  const client = new Client({
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL,
  });

  useMount(async () => {
    if (!graphId) {
      return;
    }

    if (!assistantId) {
      const assistants = await client.assistants.search({
        graphId,
      });

      const filteredAssistant = assistants.filter(
        (item) => item.name === graphId
      )[0];
      setAssistantId(filteredAssistant.assistant_id);
    }

    if (!threadId) {
      const newThreadId = await client.threads.create();
      setThreadId(newThreadId.thread_id);
    }
  });

  if (!graphId || !assistantId || !threadId) {
    return null;
  }

  return <>{children}</>;
}
