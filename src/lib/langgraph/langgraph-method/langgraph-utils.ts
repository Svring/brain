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
  tool_call_id?: string;
}

export function convertToCopilotKitMessages(
  messages: LangGraphMessage[]
): Message[] {
  const convertedMessages: Message[] = [];

  for (const message of messages) {
    // Handle system messages
    if (
      message.type === "system" ||
      message.additional_kwargs?.type === "system"
    ) {
      convertedMessages.push({
        id: message.id,
        role: "system" as const,
        content: message.content,
      });
    }
    // Handle human messages
    else if (
      message.type === "human" ||
      message.additional_kwargs?.type === "human"
    ) {
      convertedMessages.push({
        id: message.id,
        role: "user" as const,
        content: message.content,
      });
    }
    // Handle AI messages with tool calls
    else if (
      message.type === "ai" &&
      message.tool_calls &&
      message.tool_calls.length > 0
    ) {
      // Add the assistant message with content
      convertedMessages.push({
        id: message.id,
        role: "assistant" as const,
        content: message.content,
      });

      // Add tool call messages
      for (const toolCall of message.tool_calls) {
        convertedMessages.push({
          id: toolCall.id,
          role: "assistant" as const,
          content: "",
          toolCalls: [
            {
              id: toolCall.id,
              function: {
                name: toolCall.name,
                arguments: JSON.stringify(toolCall.args),
              },
              type: "function",
            },
          ],
          name: toolCall.name,
        });
      }
    }
    // Handle tool result messages
    else if (message.type === "tool") {
      convertedMessages.push({
        id: message.id,
        role: "tool" as const,
        content: message.content,
        toolCallId: message.tool_call_id || "",
        toolName: message.name || "unknown",
      });
    }
    // Handle regular AI messages without tool calls
    else if (message.type === "ai") {
      convertedMessages.push({
        id: message.id,
        role: "assistant" as const,
        content: message.content,
      });
    }
    // Default fallback
    else {
      convertedMessages.push({
        id: message.id,
        role: "assistant" as const,
        content: message.content,
      });
    }
  }

  return convertedMessages;
}

export function extractLanggraphMessages(
  thread: ThreadWithValues
): LangGraphMessage[] {
  return thread.values?.messages || [];
}

// Unified function that converts a thread directly to CopilotKit messages
export function convertThreadToCopilotKitMessages(
  thread: ThreadWithValues | undefined
): Message[] {
  if (!thread) {
    return [];
  }
  const messages = extractLanggraphMessages(thread);
  return convertToCopilotKitMessages(messages);
}
