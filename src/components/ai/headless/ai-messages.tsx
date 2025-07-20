"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { cn } from "@/lib/utils";
import { Bot, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { StateCard } from "../state-card";
import { useAiContext } from "@/contexts/ai-context/ai-context";
import ReactJson from "react-json-view";
import { useMemo, useState } from "react";
import cardTypes from "../action-cards/card-types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";

interface AiMessagesProps {
  className?: string;
}

interface MessageRendererProps {
  message: any;
  index: number;
  isCurrentMessage: boolean;
  inProgress: boolean;
}

function RenderTextMessage({
  message,
  isCurrentMessage,
  inProgress,
}: MessageRendererProps) {
  const isUser = message.role === "user";
  const isLoading = isCurrentMessage && inProgress && !isUser;

  return (
    <div className={cn("max-w-[85%]", isUser ? "ml-auto" : "mr-auto")}>
      <div
        className={cn(
          "rounded-lg px-4 py-2 text-sm break-words",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
          isLoading && "animate-pulse"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs opacity-70">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RenderActionExecutionMessage({
  message,
  isCurrentMessage,
  inProgress,
}: MessageRendererProps) {
  const isLoading = isCurrentMessage && inProgress;

  return (
    <div className="max-w-[85%] mr-auto">
      <div className="rounded-lg px-4 py-2 text-sm bg-blue-50 text-blue-800 border border-blue-200">
        <div className="font-medium mb-1">Executing Action</div>
        <div className="text-xs opacity-75">
          {message.name || "Running action..."}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RenderResultMessage({ message }: MessageRendererProps) {
  const [isOpen, setIsOpen] = useState(true); // Default to open
  const isSuccess = !message.error;
  const resultData = message.result || message.error;
  const actionName = message.actionName;

  const dataToRender = useMemo(() => {
    if (resultData === null || typeof resultData === "undefined") {
      return { result: "No result" };
    }
    if (typeof resultData === "string") {
      try {
        return JSON.parse(resultData);
      } catch (e) {
        return { result: resultData };
      }
    }
    return resultData;
  }, [resultData]);

  // Check if we have a custom card component for this action
  const CardComponent = actionName ? cardTypes[actionName] : null;

  return (
    <div className="max-w-[85%] mr-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <Card className="bg-background border">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors bg-muted">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-foreground">
                  {isSuccess ? "Action Completed" : "Action Failed"}
                  {actionName && (
                    <span className="text-xs ml-2 opacity-70">
                      ({actionName})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="bg-background text-foreground px-0 pb-0">
              {/* Render custom card component if available, otherwise fall back to ReactJson */}
              {CardComponent && isSuccess ? (
                <CardComponent data={dataToRender} actionName={actionName} />
              ) : (
                <div className="bg-gray-900 p-2 rounded text-xs overflow-auto break-words">
                  <ReactJson
                    src={dataToRender}
                    theme="apathy"
                    name={false}
                    collapsed={1}
                    displayDataTypes={false}
                    displayObjectSize={true}
                    enableClipboard={true}
                    style={{
                      fontSize: "11px",
                      backgroundColor: "bg-background",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  />
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

function RenderAgentStateMessage({ message }: MessageRendererProps) {
  const { state } = useAiContext();

  return (
    <div className="max-w-[95%] mr-auto">
      <StateCard state={state.context.state} className="max-w-md" />
    </div>
  );
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
