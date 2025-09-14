"use client";

import { PromptInputBox } from "./prompt-box";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
  submit: (data: {
    messages: Array<{ type: "human"; content: string }>;
  }) => void;
  stop: () => void;
  isLoading: boolean;
}

export function AiChatInput({
  className,
  exhibition = false,
  submit,
  stop,
  isLoading,
}: AiChatInputProps) {
  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      submit({
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
