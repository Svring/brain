"use client";

import { StickToBottom } from "@/components/ui/stick-to-bottom";
import { RenderTextMessage } from "./messages";
import { useAiCacheMessages } from "@/hooks/ai/use-ai-cache-messages";

export function AiMessages() {
  const { messages, isLoading, interrupt } = useAiCacheMessages();

  return (
    <>
      {/* <CopilotSidebar suggestions="manual" clickOutsideToClose={false} /> */}
      <StickToBottom className="h-full" resize="smooth" initial="smooth">
        <div className="h-full w-full flex flex-col">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <StickToBottom.Content className="flex flex-col h-full">
                {messages.length !== 0 && (
                  <div className="max-w-full mx-auto w-full px-4 py-0 pb-4">
                    {messages.map((message, index) => {
                      const isCurrentMessage = index === messages.length - 1;

                      return (
                        <div key={message.id} className="mb-2">
                          <RenderTextMessage
                            message={message}
                            index={index}
                            isCurrentMessage={isCurrentMessage}
                            inProgress={isLoading}
                          />

                          {/* Generative UI for assistant messages */}
                          {message.role === "assistant" &&
                            message.generativeUI?.()}
                        </div>
                      );
                    })}
                  </div>
                )}
                {interrupt}
              </StickToBottom.Content>
            </div>
          </div>
        </div>
      </StickToBottom>
    </>
  );
}
