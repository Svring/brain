"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MessageRendererProps } from "./types";
import Markdown from "react-markdown";

import "@/styles/github-markdown-dark.css";

export function RenderTextMessage({
  message,
  isCurrentMessage,
  inProgress,
}: MessageRendererProps) {
  const isUser = message.role === "user";
  const isLoading =
    isCurrentMessage && inProgress && !isUser && !message.content;

  if (
    (!message.content && !isLoading) ||
    message.role === "tool" ||
    message.role === "system"
  ) {
    return null;
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "inline-block rounded-lg py-2 text-md markdown-body",
          isUser
            ? "bg-muted rounded-2xl rounded-br-md text-foreground px-4 border border-border-primary"
            : "text-foreground px-1",
          isLoading && "animate-pulse"
        )}
      >
        <Markdown
          components={{
            ol: ({ children, ...props }) => (
              <ol className="list-decimal" {...props}>
                {children}
              </ol>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc" {...props}>
                {children}
              </ul>
            ),
          }}
        >
          {message.content ?? ""}
        </Markdown>

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
