"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MessageRendererProps } from "./types";

export function RenderTextMessage({
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