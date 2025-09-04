"use client";

import { PromptInputBox } from "./prompt-box";
import {
  useSendMessageMutation,
  useCreateNewChatSessionMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

interface AiChatInputProps {
  className?: string;
}

export function AiChatInput({ className }: AiChatInputProps) {
  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendMessageMutation();
  const { selectThread } = useChatActions();
  const { stopGeneration, isLoading } = useCopilotChatHeadless_c();
  // Create new chat session mutation
  const createChatMutation = useCreateNewChatSessionMutation();

  // NOTE: There are three bugs in copilotkit: messages aren't reset when a new chat session is created, loading existing thread could not restore its state, and sending follow-up messages in a thread has a certain probability to fail(no message sent to the server, reason unkown)
  // To Tackle the third bug, there would be a new thread created for each message sent or appended, so that there is no follow-up messages anymore, every thread is a one-shot conversation.
  // To Tackle the first bug, the 'creating new session' button would only reset the messages history rather than actually creating a new session, so that the chatbox would be clean immediately after the button has been pressed, and when the user sends a message, a new thread would be created with empty messages sent.
  // The second bug has no solution for now, so there is no laoding old thread functionality for now.
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
      onStop={stopGeneration}
    />
  );
}
