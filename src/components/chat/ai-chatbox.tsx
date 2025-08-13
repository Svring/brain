"use client";

import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AiMessages } from "./ai-messages";
import { AiChatInput } from "./ai-input";
import { AiChatHeader } from "./ai-header";

export default function AiChatbox() {
  const { sidebarChatOpen } = useChatState();
  const { closeSidebarChat } = useChatActions();

  return (
    <Sheet
      open={sidebarChatOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeSidebarChat();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-[500px] p-0 flex flex-col"
      >
        <AiChatHeader />

        <div className="flex-1 min-h-0 overflow-y-auto">
          <AiMessages />
        </div>

        <div className="p-2 pt-0 shrink-0">
          <AiChatInput />
        </div>
      </SheetContent>
    </Sheet>
  );
}
