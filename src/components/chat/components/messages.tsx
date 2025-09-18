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
import { Interrupt } from "@langchain/langgraph-sdk";
import { useStreamContext } from "@/components/provider/stream-provider";
import ReactJson from "react-json-view";

interface AiMessagesProps {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  // messages: Message[];
  // isLoading: boolean;
  // interrupt: Interrupt<unknown> | undefined;
}

export function AiMessages({
  scrollRef: externalScrollRef,
  className,
}: AiMessagesProps) {
  const { submitWithContext, interrupt, messages, isLoading } =
    useStreamContext();

  // State for interrupt data editing
  const [interruptData, setInterruptData] = useState<any>(null);

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
        </div>
      );
    });

    // Add "Thinking..." indicator when streaming
    // if (isLoading) {
    //   messageElements.push(
    //     <div key="thinking-indicator" className="mb-2">
    //       <div className="flex justify-start">
    //         <div className="flex items-center gap-2 text-xs opacity-70 px-1">
    //           <Loader2 className="w-3 h-3 animate-spin" />
    //           <span>Thinking...</span>
    //         </div>
    //       </div>
    //     </div>
    //   );
    // }

    // Add interrupt UI below all messages if it exists
    if (interrupt && interruptData) {
      messageElements.push(
        <div
          key="interrupt-ui"
          className="mt-4 p-4 border border-border-primary rounded-lg bg-background-secondary"
        >
          <p className="text-sm text-foreground mb-3">
            Action: {interruptData.action}
          </p>

          {interruptData.payload && (
            <div className="mb-4">
              <p className="text-sm text-foreground mb-2">Payload:</p>
              <div className="border border-border-primary rounded p-2 bg-background">
                <ReactJson
                  src={interruptData.payload}
                  theme="pop"
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={false}
                  onEdit={(edit) => {
                    setInterruptData((prev: any) => ({
                      ...prev,
                      payload: edit.updated_src,
                    }));
                  }}
                  onAdd={(add) => {
                    setInterruptData((prev: any) => ({
                      ...prev,
                      payload: add.updated_src,
                    }));
                  }}
                  onDelete={(del) => {
                    setInterruptData((prev: any) => ({
                      ...prev,
                      payload: del.updated_src,
                    }));
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                const responseData = {
                  ...interruptData,
                  approve: true,
                };
                submitWithContext({
                  messages: [],
                  command: { resume: JSON.stringify(responseData) },
                });
              }}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const responseData = {
                  ...interruptData,
                  approve: false,
                };
                submitWithContext({
                  messages: [],
                  command: { resume: JSON.stringify(responseData) },
                });
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      );
    }

    return messageElements;
  }, [messages, interrupt, interruptData]);

  const contentHash = useMemo(() => {
    // Prevent error if messages is undefined or not an array
    if (!messages || !Array.isArray(messages)) {
      return "";
    }

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
