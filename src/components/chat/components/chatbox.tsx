"use client";

import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AiMessages } from "./messages";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { useUnmount } from "@reactuses/core";
import { useProjectActions } from "@/contexts/project/project-context";

export default function AiChatbox() {
  const { sidebarChatOpen } = useChatState();
  const { closeSidebarChat } = useChatActions();

  const { clearSelectedResource } = useProjectActions();

  useUnmount(() => {
    clearSelectedResource();
  });

  return (
    <Sheet
      open={sidebarChatOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeSidebarChat();
        }
      }}
    >
      <SheetContent side="right" className="w-[40vw]! p-0 flex flex-col gap-2">
        <AiChatHeader />

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          <AiMessages />
        </div>

        <div className="p-2 pt-0 shrink-0">
          <AiChatInput />
        </div>
      </SheetContent>
    </Sheet>
  );
}
