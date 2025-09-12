"use client";

import { PromptInputBox } from "./prompt-box";
import {
  useSendMessageMutation,
  useCreateNewChatSessionMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useResourceThreads } from "@/hooks/langgraph/use-resource-thread";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
}

export function AiChatInput({
  className,
  exhibition = false,
}: AiChatInputProps) {
  const { mutate: sendMessage } = useSendMessageMutation();
  const { stopGeneration, isLoading } = useCopilotChatHeadless_c();
  const { selectThread } = useChatActions();

  // Use resource threads to get the latest thread
  const { latestThreadId } = useResourceThreads();

  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      sendMessage({
        role: "user",
        content: message.trim(),
      });
    }
  };

  return (
    <PromptInputBox
      className={className}
      isLoading={isLoading}
      onSend={handleSendMessage}
      placeholder=""
      disableInput={false}
      disableSend={isLoading}
      onStop={stopGeneration}
      exhibition={exhibition}
    />
  );
}
