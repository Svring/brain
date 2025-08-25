"use client";

import { RenderTextMessage } from "../messages/text-message";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { SystemMessageType } from "../messages/system-messages.tsx/systemp-message-types";
import { get } from "lodash";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import React, { useMemo, memo } from "react";

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

export function AiMessages() {
  const { messages, isLoading, interrupt } = useCopilotChatHeadless_c({
    id: "chat",
  });

  const { scrollRef, isAtBottom, scrollToBottom } = useAutoScroll({
    offset: 20,
    smooth: true,
    content: messages.length,
  });

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

  // console.log("messages", messages);

  return (
    <>
      {messages.length !== 0 && (
        <div className="w-full px-4 h-full relative">
          <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hide">
            {memoizedMessages}
          </div>

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
