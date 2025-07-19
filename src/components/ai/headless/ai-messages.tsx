"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { StateCard } from "../state-card";
import { useAiContext } from "@/contexts/ai-context/ai-context";

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
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "rounded-lg px-4 py-2 text-sm break-words",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
          isLoading && "animate-pulse"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {isLoading && (
          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
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
    <div className="flex gap-3 max-w-[85%] mr-auto">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-blue-100 text-blue-600">
          <Loader2 className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>

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
  const isSuccess = !message.error;

  return (
    <div className="flex gap-3 max-w-[85%] mr-auto">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback
          className={cn(
            isSuccess
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          )}
        >
          {isSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "rounded-lg px-4 py-2 text-sm border",
          isSuccess
            ? "bg-green-50 text-green-800 border-green-200"
            : "bg-red-50 text-red-800 border-red-200"
        )}
      >
        <div className="font-medium mb-1">
          {isSuccess ? "Action Completed" : "Action Failed"}
        </div>
        <div className="text-xs opacity-75 whitespace-pre-wrap">
          {message.result || message.error || "No result"}
        </div>
      </div>
    </div>
  );
}

function RenderAgentStateMessage({ message }: MessageRendererProps) {
  const { state } = useAiContext();
  
  return (
    <div className="flex gap-3 max-w-[95%] mr-auto">
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
        <AvatarFallback className="bg-purple-100 text-purple-600">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="mb-2">
          <div className="text-sm font-medium text-purple-800">Agent State Update</div>
          {message.state && (
            <div className="text-xs text-purple-600 mt-1">
              {message.state}
            </div>
          )}
        </div>
        <StateCard state={state.context.state} className="max-w-md" />
      </div>
    </div>
  );
}

export function AiMessages({ className }: AiMessagesProps) {
  const { visibleMessages, isLoading } = useCopilotChat();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 h-full overflow-y-auto p-4",
        className
      )}
    >
      {visibleMessages.map((message, index) => {
        const isCurrentMessage = index === visibleMessages.length - 1;
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
      {visibleMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <Avatar className="w-12 h-12 mb-4">
            <AvatarFallback className="bg-muted">
              <Bot className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div className="text-lg font-semibold mb-2">Hi! I'm Sealos Brain</div>
          <div className="text-sm">How can I help you today?</div>
        </div>
      )}
    </div>
  );
}
