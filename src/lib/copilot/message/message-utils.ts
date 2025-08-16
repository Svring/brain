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
  assistantContent: string,
  systemMessageData: SystemMessageData
) => {
  // Send a message about the resource
  setMessages([
    ...messages,
    {
      id: randomId(),
      role: "assistant",
      content: assistantContent,
    },
    {
      id: randomId(),
      role: "system",
      content: JSON.stringify(systemMessageData),
    },
  ]);

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
    assistantContent: string,
    systemMessageData: SystemMessageData
  ) => {
    emitSystemMessage(
      setMessages,
      messages,
      openSidebarChat,
      assistantContent,
      systemMessageData
    );
  };

  return { emitMessage };
};
