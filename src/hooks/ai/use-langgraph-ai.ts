import { Client } from "@langchain/langgraph-sdk";
import { useCallback } from "react";

export interface UseLangGraphAiOptions {
  apiUrl?: string;
}

export interface LangGraphMessage {
  role: string;
  content: string;
}

export interface StreamMessageParams {
  messages: LangGraphMessage[];
  state?: any;
  assistantId: string;
  threadId?: string;
}

export function useLangGraphAi(options: UseLangGraphAiOptions = {}) {
  const { apiUrl = "http://localhost:2025" } = options;
  const client = new Client({ apiUrl });

  const streamMessage = useCallback(
    async ({ messages, state, assistantId, threadId }: StreamMessageParams) => {
      try {
        // Create thread if not provided
        const thread = threadId
          ? { id: threadId }
          : await client.threads.create();

        const input = {
          messages,
          ...(state && state),
        };

        // Handle threadId properly for the stream method
        const streamResponse = threadId
          ? client.runs.stream(threadId, assistantId, {
              input,
              streamMode: "updates",
            })
          : client.runs.stream(null, assistantId, {
              input,
              streamMode: "updates",
            });

        const chunks = [];
        for await (const chunk of streamResponse) {
          if (chunk.data && !("run_id" in chunk.data)) {
            console.log(chunk.data);
            chunks.push(chunk.data);
          }
        }

        return {
          thread,
          response: chunks,
        };
      } catch (error) {
        console.error("Error streaming message:", error);
        throw error;
      }
    },
    [client, apiUrl]
  );

  const createThread = useCallback(async () => {
    try {
      return await client.threads.create();
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    }
  }, [client]);

  return {
    client,
    streamMessage,
    createThread,
  };
}
