"use client";

import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface AiChatHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AiChatHeader({
  title = "AI Assistant",
  description = "Chat with Sealos Brain AI to help with your projects",
  className = "p-6 pb-0 flex-shrink-0",
}: AiChatHeaderProps) {
  return (
    <SheetHeader className={className}>
      <SheetTitle>{title}</SheetTitle>
      <SheetDescription>{description}</SheetDescription>
    </SheetHeader>
  );
}
