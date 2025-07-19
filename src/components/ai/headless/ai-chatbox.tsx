"use client";

import { useAiContext } from "@/contexts/ai-context/ai-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AiMessages } from "./ai-messages";
import { useCopilotChat } from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Square } from "lucide-react";
import { useState } from "react";

export default function AiChatbox() {
  const { state, send } = useAiContext();
  const { appendMessage, stopGeneration, isLoading } = useCopilotChat();
  const [inputValue, setInputValue] = useState("");

  const isChatOpen = state.context.chat.open;

  const handleClose = () => {
    send({ type: "CHAT_CLOSE" });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      appendMessage(
        new TextMessage({
          role: MessageRole.User,
          content: inputValue.trim(),
        })
      );
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStopGeneration = () => {
    stopGeneration();
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
        <SheetHeader className="p-6 pb-0 flex-shrink-0">
          <SheetTitle>AI Assistant</SheetTitle>
          <SheetDescription>
            Chat with Sealos Brain AI to help with your projects
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0">
          <AiMessages className="h-full" />
        </div>

        <div className="p-6 pt-0 flex-shrink-0 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            {isLoading ? (
              <Button
                onClick={handleStopGeneration}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
