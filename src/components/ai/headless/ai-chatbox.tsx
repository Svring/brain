"use client";

import { useAiContext } from "@/contexts/ai-context/ai-context";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AiMessages } from "./ai-messages";
import { AiChatInput } from "./ai-input";
import { AiChatHeader } from "./ai-header";

export default function AiChatbox() {
  const { state, send } = useAiContext();

  const isChatOpen = state.context.chat.open;

  const handleClose = () => {
    send({ type: "CHAT_CLOSE" });
  };

  return (
    <Sheet
      open={isChatOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-[500px] p-0 flex flex-col"
        onClose={handleClose}
      >
        <AiChatHeader />

        <div className="flex-1 min-h-0">
          <AiMessages className="h-full" />
        </div>

        <div className="p-2 pt-0 flex-shrink-0">
          <AiChatInput />
        </div>
      </SheetContent>
    </Sheet>
  );
}
