"use client";

import { RenderTextMessage } from "../messages/text-message";
import { SystemMessageType } from "../messages/system-messages/systemp-message-types";
import { ToolMessageType } from "../messages/tool-messages/tool-message-types";
import { get } from "lodash";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader2 } from "lucide-react";
import React, { useMemo, memo, useEffect } from "react";
import { createHash } from "crypto";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import { useStreamContext } from "@/components/provider/stream-provider";
import type { Message } from "@langchain/langgraph-sdk";
import { useThreads } from "@/components/provider/thread-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";

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
  result,
  id,
  tool_call_id,
  status,
}: {
  content: string;
  result?: any;
  id?: string;
  tool_call_id?: string;
  status?: string;
}) {
  const { setMessages } = useThreads();
  const { sendMessage } = useStreamContext();

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
      return {
        action: null,
        payload: { content: content },
      };
    } catch {
      // If parsing fails, return the content as plain text
      return {
        action: null,
        payload: { content: content },
      };
    }
  }, [content]);

  // Create onSuccess function when result is not present
  const onSuccess = useMemo(() => {
    if (result) return undefined; // Don't provide onSuccess if result is already present

    return (successResult: any) => {
      // Update the existing message with the new result data
      if (id) {
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            if (message.id === id) {
              // Update the message with the new result
              return {
                ...message,
                additional_kwargs: {
                  ...(message as any).additional_kwargs,
                  result: successResult,
                },
              };
            }
            return message;
          });
        });

        // Continue with the next step in the conversation
        sendMessage([{ type: "system", content: successResult }]);
      }
    };
  }, [result, id, setMessages, sendMessage]);

  // Try to get the specific component for this action
  const Component = action ? get(ToolMessageType, action) : null;

  if (Component) {
    return Component(payload, result, onSuccess);
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
  const { threadsLoading } = useThreads();
  const { isStreaming } = useThreads();

  console.log("isStreaming", isStreaming);

  // Show loading screen when threads are loading
  if (threadsLoading) {
    return <LoadingScreen text="Loading messages..." />;
  }

  useEffect(() => {
    setSidebarResponding(isLoading);
  }, [isLoading]);

  const memoizedMessages = useMemo(() => {
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
