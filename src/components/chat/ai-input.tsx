"use client";

import { PromptInputBox } from "./ai-prompt-box";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { randomId } from "@copilotkit/shared";

interface AiChatInputProps {
  className?: string;
}

export function AiChatInput({ className }: AiChatInputProps) {
  const { sendMessage, isLoading } = useCopilotChatHeadless_c({ id: "chat" });

  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      sendMessage({
        id: randomId(),
        role: "user",
        content: message.trim(),
      });
    }
  };

  return (
    <div className={className}>
      <PromptInputBox
        isLoading={isLoading}
        onSend={handleSendMessage}
        placeholder="Type your message..."
        disableInput={false}
        disableSend={isLoading}
      />
    </div>
  );
}
