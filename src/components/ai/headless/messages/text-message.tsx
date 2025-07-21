"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MessageRendererProps } from "./types";
import { AnimatedMarkdown } from "flowtoken";

import "flowtoken/dist/styles.css";

export function RenderTextMessage({
  message,
  isCurrentMessage,
  inProgress,
}: MessageRendererProps) {
  const isUser = message.role === "user";
  const isLoading =
    isCurrentMessage && inProgress && !isUser && !message.content;

  // Don't render empty messages unless they're loading
  if ((!message.content && !isLoading) || message.role === "tool") {
    return null;
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "inline-block rounded-lg px-4 py-2 text-sm break-words",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
          isLoading && "animate-pulse"
        )}
      >
        <AnimatedMarkdown
          content={message.content ?? ""}
          animation="fadeIn"
          animationDuration="0.2s"
          animationTimingFunction="ease-in-out"
        />
        {/* <span>{message.content}</span> */}

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
