"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { StickToBottom } from "@/components/ui/stick-to-bottom";
import { RenderTextMessage } from "./messages";
import type { MessageRendererProps } from "./messages";

interface AiMessagesProps {
  className?: string;
}

export function AiMessages({ className }: AiMessagesProps) {
  const { visibleMessages, isLoading } = useCopilotChat();

  console.log("visibleMessages", visibleMessages);

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
                {visibleMessages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4">💬</div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        What is on the agenda today?
                      </h2>
                      <p className="text-gray-600">
                        Start a conversation to get help with anything.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-full mx-auto w-full px-4 py-8">
                    {visibleMessages.map((message, index) => {
                      const isCurrentMessage =
                        index === visibleMessages.length - 1;

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

                          {/* Tool call results */}
                          {message.role === "tool" && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                  Tool: {message.toolName}
                                </span>
                                <div className="mt-1 font-mono text-xs">
                                  {message.content || "No response"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </StickToBottom.Content>
            </div>
          </div>
        </div>
      </StickToBottom>
    </>
  );
}
