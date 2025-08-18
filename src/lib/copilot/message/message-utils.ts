import { randomId } from "@copilotkit/shared";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

interface SystemMessageData {
  type: string;
  payload: any;
}

/**
 * Utility function to emit a system message and open the sidebar chat
 * @param setMessages - Function to set messages from useCopilotChatHeadless_c
 * @param messages - Current messages array from useCopilotChatHeadless_c
 * @param openSidebarChat - Function to open sidebar chat from useChatActions
 * @param assistantContent - Content for the assistant message
 * @param systemMessageData - Data for the system message (type and payload)
 */
export const emitSystemMessage = (
  setMessages: ReturnType<typeof useCopilotChatHeadless_c>["setMessages"],
  messages: ReturnType<typeof useCopilotChatHeadless_c>["messages"],
  openSidebarChat: ReturnType<typeof useChatActions>["openSidebarChat"],
  systemMessageData: SystemMessageData,
  assistantContent?: string
) => {
  // Send a message about the resource
  const newMessages = [
    ...messages,
    {
      id: randomId(),
      role: "system" as const,
      content: JSON.stringify(systemMessageData),
    },
  ];

  // Only add assistant message if content is provided
  if (assistantContent) {
    newMessages.splice(-1, 0, {
      id: randomId(),
      role: "assistant" as const,
      content: assistantContent,
    });
  }

  setMessages(newMessages);

  // Open the sidebar chat
  openSidebarChat();
};

/**
 * Hook to get the emitSystemMessage function with current context
 * @returns Object containing emitSystemMessage function
 */
export const useEmitSystemMessage = () => {
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();

  const emitMessage = (
    systemMessageData: SystemMessageData,
    assistantContent?: string
  ) => {
    emitSystemMessage(
      setMessages,
      messages,
      openSidebarChat,
      systemMessageData,
      assistantContent
    );
  };

  return { emitMessage };
};
