"use client";

import { PromptInputBox } from "./prompt-box";
import { useSendMessageMutation, useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useAuthState } from "@/contexts/auth/auth-context";

interface AiChatInputProps {
  className?: string;
}

export function AiChatInput({ className }: AiChatInputProps) {
  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendMessageMutation();
  const { selectThread } = useChatActions();
  const { auth } = useAuthState();
  const { selectedProject } = useProjectState();

  // Create new chat session mutation
  const createChatMutation = useCreateNewChatSessionMutation({
    kubeconfig: auth?.kubeconfig || "",
    projectName: selectedProject || undefined,
  });

  const isLoading = isSendingMessage || createChatMutation.isPending;

  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      // Create a new chat session first, then send the message
      createChatMutation.mutate(undefined, {
        onSuccess: (thread) => {
          // Select the newly created thread
          selectThread(thread.thread_id);
          
          // Send the message
          sendMessage({
            role: "user",
            content: message.trim(),
          });
        },
      });
    }
  };

  return (
    <PromptInputBox
      className={className}
      isLoading={isLoading}
      onSend={handleSendMessage}
      placeholder="Type your message..."
      disableInput={false}
      disableSend={isLoading}
    />
  );
}
