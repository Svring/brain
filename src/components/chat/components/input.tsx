"use client";

import { PromptInputBox } from "./prompt-box";
import type { Message } from "@langchain/langgraph-sdk";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
  onSubmit: (...args: any[]) => any;
  onStop: () => void;
  isLoading: boolean;
}

export function AiChatInput({
  className,
  exhibition = false,
  onSubmit,
  onStop,
  isLoading,
}: AiChatInputProps) {
  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      type: "human",
      content: message.trim(),
    };
    onSubmit(
      { messages: [userMessage] },
      {
        optimisticValues(prev: any) {
          const prevMessages = prev.messages ?? [];
          const newMessages = [...prevMessages, userMessage];
          return { ...prev, messages: newMessages };
        },
      }
    );
  };

  const handleStop = () => {
    onStop();
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
