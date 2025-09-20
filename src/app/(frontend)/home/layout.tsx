"use client";

import type { ReactNode } from "react";
import { ThreadProvider } from "@/components/provider/thread-provider";
import { HomeChatProvider } from "@/components/provider/home-chat-provider";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <ThreadProvider>
      <HomeChatProvider>
        {children}
      </HomeChatProvider>
    </ThreadProvider>
  );
}
