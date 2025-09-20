"use client";

import React from "react";
import { useChatState } from "@/contexts/chat/chat-context";
import { ChatInstanceProvider } from "@/components/provider/chat-instance-provider";
import AiChatbox from "./components/chatbox";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export function ChatManager() {
  const { activeResourceTargets, chatInstances } = useChatState();

  return (
    <>
      {activeResourceTargets.map((resourceTargetKey) => {
        const chatInstance = chatInstances.get(resourceTargetKey);
        if (!chatInstance?.resourceTarget) return null;
        
        return (
          <ChatInstanceProvider key={resourceTargetKey} resourceTarget={chatInstance.resourceTarget}>
            <AiChatbox />
          </ChatInstanceProvider>
        );
      })}
    </>
  );
}

export default ChatManager;
