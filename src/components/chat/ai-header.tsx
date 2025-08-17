"use client";

import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface AiChatHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AiChatHeader({
  title = "AI Assistant",
  description = "Chat with Sealos Brain AI to help with your projects",
  className = "p-6 pb-0 shrink-0",
}: AiChatHeaderProps) {
  const { mutate: createNewChatSession, isPending } =
    useCreateNewChatSessionMutation();

  const handleNewChat = () => {
    createNewChatSession();
  };

  return (
    <SheetHeader className={className}>
      <div className="flex items-center gap-4">
        <div>
          <SheetTitle>{title}</SheetTitle>
          {/* <SheetDescription>{description}</SheetDescription> */}
        </div>
        <Button
          onClick={handleNewChat}
          disabled={isPending}
          size="sm"
          variant="outline"
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isPending ? "Creating..." : "New Chat"}
        </Button>
      </div>
    </SheetHeader>
  );
}
