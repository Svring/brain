"use client";

import { useAiState, useAiActions } from "@/contexts/ai/ai-context";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AiMessages } from "./ai-messages";
import { AiChatInput } from "./ai-input";
import { AiChatHeader } from "./ai-header";

export default function AiChatbox() {
  const { chat } = useAiState();
  const { closeChat } = useAiActions();

  return (
    <Sheet
      open={chat.open}
      onOpenChange={(open) => {
        if (!open) {
          closeChat();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-[500px] p-0 flex flex-col"
        onClose={closeChat}
      >
        <AiChatHeader />

        <div className="flex-1 min-h-0">
          <AiMessages />
        </div>

        <div className="p-2 pt-0 flex-shrink-0">
          <AiChatInput />
        </div>
      </SheetContent>
    </Sheet>
  );
}
