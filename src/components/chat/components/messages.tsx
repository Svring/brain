"use client";

import { RenderTextMessage } from "../messages/text-message";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader2 } from "lucide-react";
import React, { useMemo, useEffect, useState } from "react";
import { createHash } from "crypto";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import type { Message } from "@langchain/langgraph-sdk";
import { useThreads } from "@/components/provider/thread-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { SystemMessageRenderer } from "./system-message-renderer";
import { ToolResultRenderer } from "./tool-result-renderer";

interface AiMessagesProps {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  messages: Message[];
  isLoading: boolean;
}

export function AiMessages({
  scrollRef: externalScrollRef,
  className,
  messages,
  isLoading,
}: AiMessagesProps) {
  const { setSidebarResponding } = useChatActions();
  const { threadsLoading } = useThreads();
  const { isStreaming } = useThreads();
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  useEffect(() => {
    setSidebarResponding(isLoading);
  }, [isLoading]);

  // Log messages changes
  useEffect(() => {
    console.log("[AiMessages] Messages changed:", {
      messageCount: messages.length,
      isLoading,
      isStreaming,
      messages: messages.map((msg) => ({
        id: msg.id,
        type: msg.type,
        contentLength: typeof msg.content === "string" ? msg.content.length : 0,
        hasResult: !!(msg as any).additional_kwargs?.result,
      })),
    });
  }, [messages, isLoading, isStreaming]);

  const memoizedMessages = useMemo(() => {
    console.log("[AiMessages] Rendering messages:", messages);

    const messageElements = messages.map((message, index) => {
      const isLastMessage = index === messages.length - 1;
      const isCurrentMessage = isLastMessage && isLoading;

      return (
        <div key={message.id} className="mb-2">
          <RenderTextMessage message={message} inProgress={false} />
          {message.type === "system" && typeof message.content === "string" && (
            <SystemMessageRenderer content={message.content} />
          )}
          {message.type === "tool" && typeof message.content === "string" && (
            <ToolResultRenderer
              content={message.content}
              result={(message as any).additional_kwargs?.result}
              id={message.id}
              tool_call_id={(message as any).tool_call_id}
              status={(message as any).status}
            />
          )}
        </div>
      );
    });

    // Add "Thinking..." indicator when streaming
    if (isStreaming) {
      messageElements.push(
        <div key="thinking-indicator" className="mb-2">
          <div className="flex justify-start">
            <div className="flex items-center gap-2 text-xs opacity-70 px-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        </div>
      );
    }

    return messageElements;
  }, [messages, isLoading, isStreaming]);

  const contentHash = useMemo(() => {
    const contentString = messages
      .map((msg) => `${msg.id}-${msg.type}-${msg.content || ""}`)
      .join("|");
    return createHash("sha256").update(contentString).digest("hex");
  }, [messages]);

  const {
    scrollRef: internalScrollRef,
    isAtBottom,
    scrollToBottom,
  } = useAutoScroll({
    offset: 20,
    smooth: true,
    content: contentHash,
    scrollRef: externalScrollRef,
  });

  const scrollRef = externalScrollRef || internalScrollRef;

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [contentHash]);

  return (
    <>
      {messages.length > 0 && (
        <div className={`w-full px-4 h-full relative ${className || ""}`}>
          <div className="max-w-3xl mx-auto h-full">
            {externalScrollRef ? (
              <div className="h-full">{memoizedMessages}</div>
            ) : (
              <div
                ref={scrollRef}
                className="h-full overflow-y-auto scrollbar-hide"
              >
                {memoizedMessages}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
