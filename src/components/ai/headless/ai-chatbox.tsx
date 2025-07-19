"use client";

import { useAiContext } from "@/contexts/ai-context/ai-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CopilotChat } from "@copilotkit/react-ui";

export default function AiChatbox() {
  const { state, send } = useAiContext();
  
  const isChatOpen = state.context.chat.open;

  const handleClose = () => {
    send({ type: "CHAT_CLOSE" });
  };

  return (
    <Sheet open={isChatOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <SheetContent side="right" className="w-[500px] p-0" onClose={handleClose}>
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>AI Assistant</SheetTitle>
          <SheetDescription>
            Chat with Sealos Brain AI to help with your projects
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 p-6 pt-0">
          <CopilotChat
            className="h-full"
            labels={{
              title: "Sealos Brain",
              initial: "Hi! I'm Sealos Brain. How can I help you today?",
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}