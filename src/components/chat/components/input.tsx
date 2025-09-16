"use client";

import { PromptInputBox } from "./prompt-box";
import type { Message } from "@langchain/langgraph-sdk";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
  streamThread: (messages: Message[]) => Promise<any>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  selectedThreadId: string | null;
  isStreaming: boolean;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  stop: () => void;
}

export function AiChatInput({
  className,
  exhibition = false,
  streamThread,
  messages,
  setMessages,
  selectedThreadId,
  isStreaming,
  setIsStreaming,
  isLoading,
  stop,
}: AiChatInputProps) {
  const queryClient = useQueryClient();

  // console.log("messages in input", messages);

  const handleSendMessage = async (message: string) => {
    if (message.trim() && !isLoading) {
      // Set streaming state to true
      setIsStreaming(true);

      // Add the user message to the messages list immediately
      const userMessage: Message = {
        type: "human",
        content: message.trim(),
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const stream = await streamThread([userMessage]);

      let assistantMessageIndex = updatedMessages.length;

      try {
        for await (const event of stream) {
          if (event.event === "messages/partial" && event.data) {
            const messageData = event.data[0];
            const currentMessages = [...updatedMessages];
            currentMessages[assistantMessageIndex] = messageData;
            setMessages(currentMessages);
          }
        }
      } finally {
        // Set streaming state to false when streaming completes
        setIsStreaming(false);

        // After streaming completes, invalidate thread state query to fetch latest server state
        if (selectedThreadId) {
          queryClient.invalidateQueries({
            queryKey: ["threadState", selectedThreadId],
          });
        }
      }
    }
  };

  const handleStop = () => {
    stop();
  };

  return (
    <PromptInputBox
      className={className}
      isLoading={isLoading}
      onSend={handleSendMessage}
      placeholder=""
      disableInput={false}
      disableSend={isLoading}
      onStop={handleStop}
      exhibition={exhibition}
    />
  );
}
