"use client";

import { PromptInputBox } from "./prompt-box";
import {
  useSendMessageMutation,
  useCreateNewChatSessionMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useResourceThreads } from "@/hooks/langgraph/use-resource-thread";
import { extractLanggraphMessages, convertToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";

interface AiChatInputProps {
  className?: string;
  exhibition?: boolean;
}

export function AiChatInput({ className, exhibition = false }: AiChatInputProps) {
  const { mutate: sendMessage, isPending: isSendingMessage } =
    useSendMessageMutation();
  const { stopGeneration, isLoading } = useCopilotChatHeadless_c();
  const { setMessages } = useCopilotChatHeadless_c();
  const { selectThread } = useChatActions();
  const { setConfig } = useLanggraphActions();
  
  // Use resource threads to get the latest thread
  const { threads, threadsLoading } = useResourceThreads();
  const createChatMutation = useCreateNewChatSessionMutation();

  const handleSendMessage = (message: string) => {
    if (message.trim() && !isLoading) {
      // Standard process: Load/Create thread first
      const ensureThreadExists = () => {
        if (threads && threads.length > 0) {
          // Thread exists, select it with langgraph action
          const latestThread = threads[0];
          selectThread(latestThread.thread_id);
          
          // Load messages from latest thread
          const extractedMessages = extractLanggraphMessages(latestThread);
          const convertedMessages = convertToCopilotKitMessages(extractedMessages);
          setMessages(convertedMessages);
          
          // Proceed to send message
          sendMessage({
            role: "user",
            content: message.trim(),
          });
        } else {
          // No thread exists, create one first
          createChatMutation.mutate(undefined, {
            onSuccess: (newThread) => {
              // Select the new thread with langgraph action
              selectThread(newThread.thread_id);
              
              // Proceed to send message
              sendMessage({
                role: "user",
                content: message.trim(),
              });
            },
          });
        }
      };

      // Wait for threads to load if necessary
      if (threadsLoading) {
        setTimeout(ensureThreadExists, 100);
      } else {
        ensureThreadExists();
      }
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
