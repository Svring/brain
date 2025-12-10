"use client";

import type { Interrupt, Message } from "@langchain/langgraph-sdk";
import { createHash } from "crypto";
import {
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Hammer,
  Loader2,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { RenderTextMessage } from "../messages/text-message";
import { SystemMessageRenderer } from "./system-message-renderer";
import { ToolCallRenderer } from "./tool-call-renderer";
import { ToolResultRenderer } from "./tool-result-renderer";

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

  // Resource quota checker
  const { checkAndShowQuotaError } = useResourceQuotaChecker();

  // Function to calculate resource requirements for create/update actions
  const calculateResourceRequirements = (action: string, payload: any) => {
    let totalCpu = 0;
    let totalMemory = 0;
    let totalStorage = 0;
    let totalPorts = 0;

    // Get default resource values from schemas
    const devboxDefaults = devboxCreateFormSchema.parse({});
    const clusterDefaults = clusterCreateFormSchema.parse({});
    const launchpadDefaults = launchpadCreateFormSchema.parse({});

    if (action === "create_devbox") {
      // Devbox resource calculation
      totalCpu += payload.cpu || devboxDefaults.resource.cpu;
      totalMemory += payload.memory || devboxDefaults.resource.memory;
      totalPorts += payload.ports?.length || 0;
    } else if (action === "create_cluster") {
      // Cluster resource calculation
      totalCpu += payload.cpu || clusterDefaults.resource.cpu;
      totalMemory += payload.memory || clusterDefaults.resource.memory;
      totalStorage += payload.storage || clusterDefaults.resource.storage || 0;
    } else if (action === "create_launchpad") {
      // Launchpad resource calculation
      totalCpu += payload.cpu || launchpadDefaults.resource.cpu;
      totalMemory += payload.memory || launchpadDefaults.resource.memory;
      totalPorts += payload.ports?.length || 0;
    }

    return { totalCpu, totalMemory, totalStorage, totalPorts };
  };

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
    if (
      (isLoading &&
        (messages.at(-1)?.type === "human" ||
          messages.at(-1)?.type === "system")) ||
      messages.at(-1)?.content === ""
    ) {
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
            <div className="p-2 border-t border-muted/20">
              <div className="mb-4">
                <ToolCallRenderer
                  content={JSON.stringify({
                    action: interruptData.action,
                    payload: interruptData.payload,
                  })}
                  setInterruptData={setInterruptData}
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
                    // Check resource quota before approving
                    const resourceRequirements = calculateResourceRequirements(
                      interruptData.action,
                      interruptData.payload
                    );

                    const quotaCheckPassed = checkAndShowQuotaError({
                      cpu: resourceRequirements.totalCpu,
                      memory: resourceRequirements.totalMemory,
                      storage: resourceRequirements.totalStorage,
                      ports: resourceRequirements.totalPorts,
                    });

                    if (!quotaCheckPassed) {
                      return; // Don't proceed if quota check fails
                    }

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
