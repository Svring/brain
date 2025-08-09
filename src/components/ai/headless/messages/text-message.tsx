"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MessageRendererProps } from "./types";
import { AnimatedMarkdown } from "flowtoken";
import Markdown from "react-markdown";

import "flowtoken/dist/styles.css";
import "@/styles/github-markdown-dark.css";

export function RenderTextMessage({
  message,
  isCurrentMessage,
  inProgress,
}: MessageRendererProps) {
  const isUser = message.role === "user";
  const isLoading =
    isCurrentMessage && inProgress && !isUser && !message.content;

  // Don't render empty messages unless they're loading
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
        {/* <AnimatedMarkdown
          content={message.content ?? ""}
          animation="fadeIn"
          animationDuration="0.2s"
          animationTimingFunction="ease-in-out"
        /> */}

        {/* <p>{dummyMessage ?? ""}</p> */}

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

        {/* <Markdown>{dummyMessage ?? ""}</Markdown> */}

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
