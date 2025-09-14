"use client";

import { RenderTextMessage } from "../messages/text-message";
import { SystemMessageType } from "../messages/system-messages/systemp-message-types";
import { ToolMessageType } from "../messages/tool-messages/tool-message-types";
import { get } from "lodash";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import React, { useMemo, memo, useEffect } from "react";
import { createHash } from "crypto";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import type { Message } from "@langchain/langgraph-sdk";

const SystemMessageRenderer = memo(function SystemMessageRenderer({
  content,
}: {
  content: string;
}) {
  const { type, target, payload } = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return {
        type: parsed.type,
        target: parsed.target,
        payload: parsed.payload,
      };
    } catch {
      return {};
    }
  }, [content]);

  const Component = type ? get(SystemMessageType, type) : null;
  return Component ? Component(target, payload) : null;
});

const ToolResultRenderer = memo(function ToolResultRenderer({
  content,
}: {
  content: string;
}) {
  const { action, payload } = useMemo(() => {
    try {
      // First try to parse the outer content
      const outerParsed = JSON.parse(content);

      // If it has an action and payload, return them
      if (outerParsed.action && outerParsed.payload) {
        return {
          action: outerParsed.action,
          payload: outerParsed.payload,
        };
      }

      // If it's just a string, return as is
      return { action: null, payload: { content: content } };
    } catch {
      // If parsing fails, return the content as plain text
      return { action: null, payload: { content: content } };
    }
  }, [content]);

  // Try to get the specific component for this action
  const Component = action ? get(ToolMessageType, action) : null;
  
  if (Component) {
    return Component(payload);
  }

  // Fallback to plain text rendering
  return (
    <div className="flex justify-start w-full">
      <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
        <div className="text-sm text-foreground">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
});

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
  const { scrollTrigger } = useChatState();

  console.log("messages", messages);

  useEffect(() => {
    setSidebarResponding(isLoading);
  }, [isLoading]);

  const memoizedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const isLastMessage = index === messages.length - 1;
      const isCurrentMessage = isLastMessage && isLoading;

      return (
        <div key={message.id} className="mb-2">
          <RenderTextMessage message={message} inProgress={isCurrentMessage} />
          {message.type === "system" && typeof message.content === "string" && (
            <SystemMessageRenderer content={message.content} />
          )}
          {message.type === "tool" && typeof message.content === "string" && (
            <ToolResultRenderer content={message.content} />
          )}
        </div>
      );
    });
  }, [messages, isLoading]);

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
      const timer = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timer);
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
