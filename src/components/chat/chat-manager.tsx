"use client";

import React from "react";
import { useChatState } from "@/contexts/chat/chat-context";
import { ChatInstanceProvider } from "@/components/provider/chat-instance-provider";
import AiChatbox from "./components/chatbox";

export function ChatManager() {
  const { chatInstances, chatDisplayOrder } = useChatState();

  // Don't render if no active chats
  if (!chatDisplayOrder.length) {
    return null;
  }

  // Render all active chat instances - new ones slide in from right
  return (
    <div className="relative w-full h-full overflow-hidden">
      {chatDisplayOrder.map((chatKey, index) => {
        const chatInstance = chatInstances.get(chatKey);
        if (!chatInstance) return null;

        const isActive = index === 0; // Only the first one is active
        // All chats stay at position 0, but only the active one is visible
        const slidePosition = isActive ? 0 : 100; // Active at 0%, inactive slide out to right

        return (
          <div
            key={chatKey}
            className={`absolute w-full h-full transition-all duration-500 ease-in-out ${
              isActive
                ? "z-50 opacity-100 pointer-events-auto"
                : "z-40 opacity-0 pointer-events-none"
            }`}
            style={{
              transform: `translateX(${slidePosition}%)`,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Chat content */}
            {chatInstance.projectName ? (
              <ChatInstanceProvider
                key={chatKey}
                projectName={chatInstance.projectName}
              >
                <AiChatbox />
              </ChatInstanceProvider>
            ) : chatInstance.resourceTarget ? (
              <ChatInstanceProvider
                key={chatKey}
                resourceTarget={chatInstance.resourceTarget}
              >
                <AiChatbox />
              </ChatInstanceProvider>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default ChatManager;
