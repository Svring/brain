"use client";

import { PromptInputBox } from "./prompt-box";
import { useStreamContext } from "@/components/provider/stream-provider";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
  stop: () => void;
  isLoading: boolean;
}

export function AiChatInput({
  className,
  exhibition = false,
  stop,
  isLoading,
}: AiChatInputProps) {
  const { submitWithContext } = useStreamContext();

  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      submitWithContext({
        messages: [{ type: "human", content: message.trim() }],
      });
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
