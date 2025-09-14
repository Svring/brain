"use client";

import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { AiMessages } from "./messages";
import { cn } from "@/lib/utils";
// import { useLanggraphStateUpdate } from "@/hooks/langgraph/use-langgraph-state-update";
import { useThreads } from "@/hooks/langgraph/use-threads";
import { useLanggraphStream } from "@/hooks/langgraph/use-langgraph-stream";
import { useEffect, useState } from "react";
import { useProjectState } from "@/contexts/project/project-context";

export default function AiChatbox() {
  const { sidebarChatOpen, selectedThreadId, pendingMessage } = useChatState();

  const { isLoading, stop, messages, submit } = useLanggraphStream({
    threadId: selectedThreadId || "",
  });

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100",
        sidebarChatOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <AiChatHeader isLoading={false} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages messages={messages} isLoading={isLoading} />
      </div>

      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput submit={submit} stop={stop} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
