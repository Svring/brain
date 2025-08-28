"use client";

import { RenderTextMessage } from "../messages/text-message";
import {
  useCopilotChatHeadless_c,
  useCopilotContext,
} from "@copilotkit/react-core";
import { SystemMessageType } from "../messages/system-messages.tsx/systemp-message-types";
import { get } from "lodash";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import React, { useMemo, memo, useEffect } from "react";
import { createHash } from "crypto";

// import { Tiktoken } from "js-tiktoken/lite";
// import o200k_base from "js-tiktoken/ranks/o200k_base";

// const enc = new Tiktoken(o200k_base);

// Renders a system message component from serialized content. Memoized so it
// doesn't re-mount on scroll re-renders when props are unchanged.
const SystemMessageRenderer = memo(function SystemMessageRenderer({
  content,
}: {
  content: string;
}) {
  const { type, payload } = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return { type: parsed.type, payload: parsed.payload } as {
        type?: string;
        payload?: unknown;
      };
    } catch {
      return { type: undefined, payload: undefined };
    }
  }, [content]);

  const componentFunction = useMemo(() => {
    return type ? (get(SystemMessageType, type) as any) : undefined;
  }, [type]);

  if (typeof componentFunction === "function") {
    return componentFunction(payload);
  }
  return null;
});

interface AiMessagesProps {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export function AiMessages({
  scrollRef: externalScrollRef,
  className,
}: AiMessagesProps = {}) {
  const { messages, isLoading, interrupt, reset } = useCopilotChatHeadless_c({
    id: "chat",
  });

  // console.log("messages", messages);

  // const totalTokens = messages.reduce(
  //   (sum, message) => sum + enc.encode(message.content ?? "").length + 4,
  //   0
  // );
  // console.log("Total tokens:", totalTokens);

  // Memoize message list so scroll re-renders don't recreate elements
  const memoizedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const isLastMessage = index === messages.length - 1;
      const isCurrentMessage = isLastMessage && isLoading;

      return (
        <div key={message.id} className="mb-2">
          <RenderTextMessage message={message} inProgress={isCurrentMessage} />

          {message.role === "assistant" && message.generativeUI?.()}

          {message.role === "system" && typeof message.content === "string" ? (
            <SystemMessageRenderer content={message.content} />
          ) : null}
        </div>
      );
    });
  }, [messages, isLoading]);

  // Create a SHA-256 hash of all message content for reliable change detection
  const contentHash = useMemo(() => {
    const contentString = messages
      .map((msg) => `${msg.id}-${msg.role}-${msg.content || ""}`)
      .join("|");
    return createHash("sha256").update(contentString).digest("hex");
  }, [messages]);

  // console.log("contentHash", contentHash);

  const {
    scrollRef: internalScrollRef,
    isAtBottom,
    scrollToBottom,
  } = useAutoScroll({
    offset: 20,
    smooth: true,
    content: contentHash, // Use content hash to detect both length and content changes
    scrollRef: externalScrollRef, // Pass external scroll ref to the hook
  });

  // Use external scroll ref if provided, otherwise use internal one
  const scrollRef = externalScrollRef || internalScrollRef;

  // console.log("isAtBottom", isAtBottom);

  // Force scroll to bottom when new messages are added or content changes
  React.useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [contentHash]); // Use contentHash to detect both new messages and content updates

  // console.log("messages", messages);

  return (
    <>
      {messages.length !== 0 && (
        <div className={`w-full px-4 h-full relative ${className || ""}`}>
          {externalScrollRef ? (
            // If external scroll ref is provided, don't create internal scroll container
            <div className="h-full">{memoizedMessages}</div>
          ) : (
            // Otherwise, use internal scroll container
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto scrollbar-hide"
            >
              {memoizedMessages}
            </div>
          )}

          {!isAtBottom && (
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-4 right-4 rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {interrupt}
    </>
  );
}
