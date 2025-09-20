"use client";

import { useChatInstance } from "@/components/provider/chat-instance-provider";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { AiMessages } from "./messages";
import { cn } from "@/lib/utils";

export default function AiChatbox() {
  const {
    isActive,
    isFocused,
    state,
    resourceTarget,
    submit,
    stop,
    isLoading,
    messages,
    interrupt,
  } = useChatInstance();

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100",
        state.open
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <AiChatHeader />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages
          messages={messages}
          isLoading={isLoading}
          interrupt={interrupt}
        />
      </div>

      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput onSubmit={submit} onStop={stop} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
