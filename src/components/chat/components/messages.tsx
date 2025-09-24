"use client";

import { RenderTextMessage } from "../messages/text-message";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  Loader2,
  ChevronRight,
  ChevronDown,
  Hammer,
} from "lucide-react";
import React, { useMemo, useEffect, useState } from "react";
import { createHash } from "crypto";
import type { Message } from "@langchain/langgraph-sdk";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { SystemMessageRenderer } from "./system-message-renderer";
import { ToolResultRenderer } from "./tool-result-renderer";
import { ToolCallRenderer } from "./tool-call-renderer";
import { Interrupt } from "@langchain/langgraph-sdk";
import { Spinner } from "@/components/ui/spinner";

interface AiMessagesProps {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  messages: Message[];
  isLoading: boolean;
  interrupt?: Interrupt<unknown>;
  submit?: (
    data: { messages: Message[]; stage?: string; command?: any },
    options?: { optimisticValues?: (prev: any) => any; command?: any }
  ) => any;
}

export function AiMessages({
  scrollRef: externalScrollRef,
  className,
  messages,
  isLoading,
  interrupt,
  submit,
}: AiMessagesProps) {
  // State for interrupt data editing
  const [interruptData, setInterruptData] = useState<any>(null);
  const [isInterruptExpanded, setIsInterruptExpanded] = useState(true);

  console.log("messages", messages);

  // Parse interrupt value when it changes
  useEffect(() => {
    if (interrupt?.value) {
      try {
        const parsedValue =
          typeof interrupt.value === "string"
            ? JSON.parse(interrupt.value)
            : interrupt.value;
        setInterruptData(parsedValue);
      } catch (error) {
        console.error("Failed to parse interrupt value:", error);
        setInterruptData(null);
      }
    } else {
      setInterruptData(null);
    }
  }, [interrupt?.value]);

  const memoizedMessages = useMemo(() => {
    // Prevent error if messages is undefined or not an array
    if (!messages || !Array.isArray(messages)) {
      return [];
    }

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
          {/* {(message as any).type === "tool_call" && typeof (message as any).content === "string" && (
            <ToolCallRenderer
              content={(message as any).content}
              result={(message as any).additional_kwargs?.result}
              id={message.id}
              tool_call_id={(message as any).tool_call_id}
              status={(message as any).status}
            />
          )} */}
        </div>
      );
    });

    // Add "Thinking..." indicator when streaming
    if (isLoading) {
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

    // Add interrupt UI below all messages if it exists
    if (interruptData) {
      messageElements.push(
        <div
          key="interrupt-ui"
          className="mt-4 border border-border-primary rounded-lg bg-background-secondary"
        >
          <div
            className="flex items-center p-2 cursor-pointer hover:bg-muted/20 transition-all gap-2"
            onClick={() => setIsInterruptExpanded(!isInterruptExpanded)}
          >
            <span className="flex items-center">
              {isInterruptExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </span>
            <span className="flex items-center">
              <Spinner
                variant="circle"
                className="h-4 w-4 text-muted-foreground flex-shrink-0"
              />
            </span>
            <p className="text-sm text-foreground flex items-center m-0">
              <span className="text-muted-foreground">Action:</span>{" "}
              <span className="text-foreground ml-1">
                {interruptData.action}
              </span>
            </p>
          </div>

          {isInterruptExpanded && interruptData.payload && (
            <div className="px-2 pb-2 border-t border-muted/20">
              <div className="mb-4">
                <ToolCallRenderer
                  content={JSON.stringify({
                    action: interruptData.action,
                    payload: interruptData.payload,
                  })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const responseData = {
                      action: interruptData.action,
                      payload: interruptData.payload,
                      approve: false,
                    };
                    if (submit) {
                      submit(
                        { messages: [] },
                        { command: { resume: JSON.stringify(responseData) } }
                      );
                    }
                  }}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const responseData = {
                      action: interruptData.action,
                      payload: interruptData.payload,
                      approve: true,
                    };
                    if (submit) {
                      submit(
                        { messages: [] },
                        { command: { resume: JSON.stringify(responseData) } }
                      );
                    }
                  }}
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return messageElements;
  }, [messages, interruptData, isInterruptExpanded]);

  const contentHash = useMemo(() => {
    // Prevent error if messages is undefined or not an array
    if (!messages || !Array.isArray(messages)) {
      return "";
    }

    const contentString = messages
      .map((msg) => `${msg.id}-${msg.type}-${msg.content || ""}`)
      .join("|");

    // Include interrupt data and expanded state in hash for auto-scroll
    const interruptString = interruptData ? JSON.stringify(interruptData) : "";
    const expandedString = isInterruptExpanded ? "expanded" : "collapsed";

    return createHash("sha256")
      .update(contentString + "|" + interruptString + "|" + expandedString)
      .digest("hex");
  }, [messages, interruptData, isInterruptExpanded]);

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
    if (messages && Array.isArray(messages) && messages.length > 0) {
      scrollToBottom();
    }
  }, [contentHash, messages]);

  return (
    <>
      {messages && Array.isArray(messages) && messages.length > 0 && (
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
