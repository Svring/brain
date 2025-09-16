"use client";

import { PromptInputBox } from "./prompt-box";
import { useStreamContext } from "@/components/provider/stream-provider";
import { useThreads } from "@/components/provider/thread-provider";
import type { Message } from "@langchain/langgraph-sdk";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
}

export function AiChatInput({
  className,
  exhibition = false,
}: AiChatInputProps) {
  const { sendMessage, stop } = useStreamContext();
  const { isStreaming } = useThreads();

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      type: "human",
      content: message.trim(),
    };
    await sendMessage([userMessage]);
  };

  const handleStop = () => {
    stop();
  };

  return (
    <PromptInputBox
      className={className}
      isLoading={isStreaming}
      onSend={handleSendMessage}
      placeholder=""
      disableInput={false}
      disableSend={isStreaming}
      onStop={handleStop}
      exhibition={exhibition}
    />
  );
}
