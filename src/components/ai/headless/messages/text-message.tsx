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

  const dummyMessage = `The AFFiNE template is a ready-to-use tool designed as a privacy-focused and local-first alternative to popular platforms like Notion and Miro. This open-source solution provides users with a collaborative workspace for note-taking, planning, and brainstorming while prioritizing data privacy and ownership.\n\n### Key Features:\n1. **Privacy-Focused**: Ensures that your data remains secure and private, unlike cloud-driven platforms.\n2. **Local-First**: Allows you to store and manage data directly on your device without relying on third-party servers.\n3. **Open Source**: Provides transparency and customization opportunities, giving you full control over the platform.\n4. **Alternative to Notion and Miro**: Combines tools for note-taking (Notion) and whiteboarding or brainstorming (Miro) in one platform.\n\n### How to Use:\n- **Install the Template**: If you're using this on a development platform like Sealos, you might need to deploy the template and integrate it into your workspace.\n- **Setup Your Workspace**: Customize your interface to match your workflow, whether it’s for organizing tasks, creating docs, or collaborating with a team.\n- **Collaborate Seamlessly**: You can use the tool for individual productivity or encourage team collaboration, allowing for optimal brainstorming, project management, and information management.\n- **Extend Features**: Since it’s open-source, you can tweak its features or add new ones to meet specific needs.\n\nThis tool is ideal for anyone looking for a secure and self-reliant alternative to established but server-reliant productivity tools.`;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "inline-block rounded-lg py-2 text-md markdown-body",
          isUser
            ? "bg-muted rounded-2xl rounded-br-md text-foreground px-4 border border-border"
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

        <Markdown>{message.content ?? ""}</Markdown>

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
