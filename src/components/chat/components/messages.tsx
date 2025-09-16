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
  const { updateThreadState, selectedThreadId } = useThreads();
  const { submitWithContext } = useStreamContext();

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
      // Update thread state with the success data
      if (id && tool_call_id) {
        updateThreadState.mutate(
          {
            threadId: selectedThreadId,
            values: {
              messages: [
                {
                  id: id,
                  tool_call_id: tool_call_id,
                  type: "tool",
                  content: content,
                  result: successResult,
                },
              ],
            },
          },
          {
            onSuccess: () => {
              // Optional: Add any additional logic to run after successful update
              submitWithContext({
                messages: [{ type: "system", content: successResult }],
              });
            },
            onError: (error: any) => {
              console.error(
                "Failed to update thread state with tool result:",
                error
              );
            },
          }
        );
      }
    };
  }, [result, id, tool_call_id, updateThreadState, content]);

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
}

export function AiMessages({
  scrollRef: externalScrollRef,
  className,
}: AiMessagesProps) {
  const { setSidebarResponding } = useChatActions();
  const { isLoading, messages } = useStreamContext();
  const { threadsLoading } = useThreads();

  // console.log("messages", messages);

  // Show loading screen when threads are loading
  if (threadsLoading) {
    return <LoadingScreen text="Loading messages..." />;
  }

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
