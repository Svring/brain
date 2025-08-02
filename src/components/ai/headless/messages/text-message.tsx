"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MessageRendererProps } from "./types";
import { AnimatedMarkdown } from "flowtoken";
import Markdown from "react-markdown";

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
          "inline-block rounded-lg py-2 text-md break-words",
          isUser ? "bg-muted text-foreground px-4 " : "text-foreground px-1",
          isLoading && "animate-pulse"
        )}
      >
        {/* <AnimatedMarkdown
          content={message.content ?? ""}
          animation="fadeIn"
          animationDuration="0.2s"
          animationTimingFunction="ease-in-out"
        /> */}

        <p>{message.content ?? ""}</p>

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
