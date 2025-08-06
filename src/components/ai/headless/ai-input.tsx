"use client";

import { PromptInputBox } from "./ai-prompt-box";
import { useCopilotChat } from "@copilotkit/react-core";
import { randomId } from "@copilotkit/shared";

interface AiChatInputProps {
  className?: string;
}

export function AiChatInput({ className }: AiChatInputProps) {
  const { appendMessage, isLoading } = useCopilotChat({ id: "chat" });

  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      appendMessage({
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
