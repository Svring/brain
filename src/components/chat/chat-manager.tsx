"use client";

import React from "react";
import { useChatState } from "@/contexts/chat/chat-context";
import { ChatInstanceProvider } from "@/components/provider/chat-instance-provider";
import AiChatbox from "./components/chatbox";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { PROJECT_CHAT_KEY } from "@/contexts/chat/chat-machine";

export function ChatManager() {
  const { activeResourceTargets, chatInstances, focusedResourceTarget } =
    useChatState();

  // Only render the focused chat instance
  if (!focusedResourceTarget) {
    return null;
  }

  const focusedChatInstance = chatInstances.get(focusedResourceTarget);
  if (!focusedChatInstance) {
    return null;
  }

  // Handle project chat (no resourceTarget)
  if (focusedResourceTarget === PROJECT_CHAT_KEY) {
    return (
      <ChatInstanceProvider key={PROJECT_CHAT_KEY} resourceTarget={null}>
        <AiChatbox />
      </ChatInstanceProvider>
    );
  }

  // Handle resource chat (has resourceTarget)
  if (!focusedChatInstance.resourceTarget) {
    return null;
  }

  return (
    <ChatInstanceProvider
      key={focusedResourceTarget}
      resourceTarget={focusedChatInstance.resourceTarget}
    >
      <AiChatbox />
    </ChatInstanceProvider>
  );
}

export default ChatManager;
