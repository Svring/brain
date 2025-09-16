"use client";

import { useChatState } from "@/contexts/chat/chat-context";
import { useThreads } from "@/components/provider/thread-provider";
import { useStreamContext } from "@/components/provider/stream-provider";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { AiMessages } from "./messages";
import { cn } from "@/lib/utils";

export default function AiChatbox() {
  const { sidebarChatOpen } = useChatState();
  const {
    messages,
    setMessages,
    selectedThreadId,
    isStreaming,
    setIsStreaming,
  } = useThreads();
  const { streamThread, isLoading, stop } = useStreamContext();

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100",
        sidebarChatOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <AiChatHeader isLoading={isLoading} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages 
          messages={messages}
          isLoading={isLoading}
        />
      </div>

      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput
            streamThread={streamThread}
            messages={messages}
            setMessages={setMessages}
            selectedThreadId={selectedThreadId}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            isLoading={isLoading}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}
