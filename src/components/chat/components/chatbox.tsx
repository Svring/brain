"use client";

import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { AiMessages } from "./messages";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { cn } from "@/lib/utils";

export default function AiChatbox() {
  const { sidebarChatOpen } = useChatState();
  const { closeSidebarChat } = useChatActions();

  return (
    <div
      className={cn(
        "h-full w-full p-0 flex flex-col gap-2 border rounded-xl bg-background relative transition-all duration-100 ease-in-out transform mr-2",
        sidebarChatOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      {/* Left rail for closing the chat */}
      <button
        onClick={closeSidebarChat}
        className="absolute -left-2 top-0 z-50 h-full w-2 bg-transparent transition-colors group/rail cursor-e-resize hover:bg-muted/20"
        title="Close Chat"
        aria-label="Close Chat"
      >
        <span className="pointer-events-none absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rounded bg-muted opacity-0 transition-opacity group-hover/rail:opacity-100" />
      </button>

      <AiChatHeader />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages />
      </div>

      <div className="p-2 pt-0 shrink-0">
        <div className="max-w-3xl mx-auto">
          <AiChatInput />
        </div>
      </div>
    </div>
  );
}
