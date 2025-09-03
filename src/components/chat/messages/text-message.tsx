"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { Streamdown } from "streamdown";

import "@/styles/github-markdown-dark.css";

interface RenderTextMessageProps {
  message: any;
  inProgress: boolean;
}

export function RenderTextMessage({
  message,
  inProgress,
}: RenderTextMessageProps) {
  const isUser = message.role === "user";
  const isLoading = inProgress && !isUser && !message.content;

  if (
    (!message.content && !isLoading) ||
    message.role === "tool" ||
    message.role === "system"
  ) {
    return null;
  }

  // console.log("message.content", message.content);

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-lg py-2 text-md markdown-body max-w-full break-words",
          isUser
            ? "bg-muted rounded-2xl rounded-br-md text-foreground px-4 border border-border-primary"
            : "text-foreground px-1 max-w-full",
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
        {/* <Streamdown>{message.content ?? ""}</Streamdown> */}

        {isLoading && !message.content && !message.toolCalls && (
          <div className="flex items-center gap-2 text-xs opacity-70">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}

        {message.toolCalls && (
          <div className="flex items-center gap-2 text-xs opacity-70">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Executing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
