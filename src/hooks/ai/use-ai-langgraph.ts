import { Client } from "@langchain/langgraph-sdk";
import { useAiState } from "@/contexts/ai/ai-context";
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";

export function useAiLanggraph() {
  const {
    aiState: { base_url, api_key, model },
    floatingChat: { assistantId, threadId },
  } = useAiState();

  const client = new Client({
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL,
  });

  const { messages, submit, isLoading, values } = useStream<{
    messages: Message[];
    base_url: string;
    api_key: string;
    model: string;
  }>({
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL,
    assistantId: assistantId,
    threadId: threadId,
    messagesKey: "messages",
  });

  const stream = (message: string) =>
    submit({
      messages: [{ type: "human", content: message }],
      base_url,
      api_key,
      model,
    });

  console.log("messages in useAiLanggraph", messages);

  return {
    stream,
    isLoading,
    messages,
    values,
    threadId,
    client,
  };
}
