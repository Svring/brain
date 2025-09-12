import { Thread } from "@langchain/langgraph-sdk";
import { Message } from "@copilotkit/shared";

interface ThreadWithValues {
  values?: {
    messages?: LangGraphMessage[];
    [key: string]: any;
  };
}

interface LangGraphMessage {
  id: string;
  content: string;
  type: string;
  additional_kwargs?: {
    type?: string;
  };
  response_metadata?: any;
  name?: string | null;
  example?: boolean;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
  usage_metadata?: any;
}

interface CopilotKitMessage {
  id: string;
  role: "human" | "system" | "assistant";
  content: string;
}

export function convertToCopilotKitMessages(
  messages: LangGraphMessage[]
): Message[] {
  return messages.map((message) => {
    // Determine role based on type and additional_kwargs
    if (
      message.type === "human" ||
      message.additional_kwargs?.type === "human"
    ) {
      return {
        id: message.id,
        role: "user" as const,
        content: message.content,
      };
    } else if (
      message.type === "system" ||
      message.additional_kwargs?.type === "system"
    ) {
      return {
        id: message.id,
        role: "system" as const,
        content: message.content,
      };
    } else {
      // Default to 'assistant' when no role is specified
      return {
        id: message.id,
        role: "assistant" as const,
        content: message.content,
      };
    }
  });
}

export function extractLanggraphMessages(
  thread: ThreadWithValues
): LangGraphMessage[] {
  return thread.values?.messages || [];
}

// Unified function that converts a thread directly to CopilotKit messages
export function convertThreadToCopilotKitMessages(
  thread: ThreadWithValues
): Message[] {
  const messages = extractLanggraphMessages(thread);
  return convertToCopilotKitMessages(messages);
}
