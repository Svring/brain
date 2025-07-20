"use client";

import { PromptInputBox } from "../components/ai-prompt-box";
import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";

interface AiChatInputProps {
  className?: string;
}

export function AiChatInput({ className }: AiChatInputProps) {
  const { appendMessage, isLoading } = useCopilotChat();

  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      appendMessage(
        new TextMessage({
          role: MessageRole.User,
          content: message.trim(),
        })
      );
    }
  };

  return (
    <div className={className}>
      <PromptInputBox
        isLoading={isLoading}
        onSend={handleSendMessage}
        placeholder="Type your message..."
      />
    </div>
  );
}
