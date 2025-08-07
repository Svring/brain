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
    console.log("[LanggraphProvider] useMount triggered");

    if (!graphId) {
      console.log("[LanggraphProvider] No graphId found, returning");
      return;
    }

    if (!assistantId) {
      console.log(
        "[LanggraphProvider] Searching for assistants with graphId:",
        graphId
      );
      const assistants = await client.assistants.search({
        graphId,
      });
      console.log("[LanggraphProvider] Found assistants:", assistants);

      const filteredAssistant = assistants.filter(
        (item) => item.name === graphId
      )[0];
      console.log(
        "[LanggraphProvider] Setting assistantId:",
        filteredAssistant.assistant_id
      );
      setAssistantId(filteredAssistant.assistant_id);
    }

    if (!threadId) {
      console.log("[LanggraphProvider] Creating new thread");
      const newThreadId = await client.threads.create();
      console.log(
        "[LanggraphProvider] Created thread with ID:",
        newThreadId.thread_id
      );
      setThreadId(newThreadId.thread_id);
    }

    console.log("[LanggraphProvider] useMount completed");
  });

  if (!graphId || !assistantId || !threadId) {
    return null;
  }

  console.log("graphId", graphId);
  console.log("assistantId", assistantId);
  console.log("threadId", threadId);

  return <>{children}</>;
}
