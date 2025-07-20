"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { useMemo } from "react";
import {
  RenderTextMessage,
  RenderActionExecutionMessage,
  RenderResultMessage,
  RenderAgentStateMessage,
  MessageRendererProps,
} from "./messages";

interface AiMessagesProps {
  className?: string;
}



export function AiMessages({ className }: AiMessagesProps) {
  const { visibleMessages, isLoading } = useCopilotChat();

  const processedMessages = useMemo(() => {
    const seenIds = new Set();
    const resultForAction: { [key: string]: boolean } = {};

    // First pass: find all result messages
    visibleMessages.forEach((message) => {
      if (message.isResultMessage()) {
        resultForAction[message.actionExecutionId] = true;
      }
    });

    // Second pass: filter messages
    return visibleMessages.filter((message) => {
      if (seenIds.has(message.id)) {
        return false;
      }
      seenIds.add(message.id);

      // If it's an action execution message, only show it if there's no result yet
      if (message.isActionExecutionMessage() && resultForAction[message.id]) {
        return false;
      }

      return true;
    });
  }, [visibleMessages]);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 h-full overflow-y-auto p-4",
        className
      )}
    >
      {processedMessages.map((message, index) => {
        const isCurrentMessage = index === processedMessages.length - 1;
        const commonProps = {
          message,
          index,
          isCurrentMessage,
          inProgress: isLoading,
        };

        if (message.isTextMessage()) {
          return <RenderTextMessage key={message.id} {...commonProps} />;
        } else if (message.isActionExecutionMessage()) {
          return (
            <RenderActionExecutionMessage key={message.id} {...commonProps} />
          );
        } else if (message.isResultMessage()) {
          return <RenderResultMessage key={message.id} {...commonProps} />;
        } else if (message.isAgentStateMessage()) {
          return <RenderAgentStateMessage key={message.id} {...commonProps} />;
        }

        // Fallback for unknown message types
        return <RenderTextMessage key={message.id} {...commonProps} />;
      })}

      {/* Empty state */}
      {processedMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <Bot className="w-12 h-12 mb-4 text-muted-foreground" />
          <div className="text-lg font-semibold mb-2">Hi! I'm Sealos Brain</div>
          <div className="text-sm">How can I help you today?</div>
        </div>
      )}
    </div>
  );
}
