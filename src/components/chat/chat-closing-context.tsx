"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ChatClosingContextValue {
  closingChats: Set<string>;
  startClosing: (chatKey: string, onComplete: () => void) => void;
}

const ChatClosingContext = createContext<ChatClosingContextValue | undefined>(undefined);

export function ChatClosingProvider({ children }: { children: ReactNode }) {
  const [closingChats, setClosingChats] = useState<Set<string>>(new Set());

  const startClosing = useCallback((chatKey: string, onComplete: () => void) => {
    // Add to closing set to trigger slide-out animation
    setClosingChats(prev => new Set(prev).add(chatKey));

    // Wait for animation to complete (900ms for project, 1660ms for resource, use the longer one)
    setTimeout(() => {
      // Remove from closing set
      setClosingChats(prev => {
        const next = new Set(prev);
        next.delete(chatKey);
        return next;
      });
      // Call the actual close function
      onComplete();
    }, 800);
  }, []);

  return (
    <ChatClosingContext.Provider value={{ closingChats, startClosing }}>
      {children}
    </ChatClosingContext.Provider>
  );
}

export function useChatClosing() {
  const context = useContext(ChatClosingContext);
  if (!context) {
    throw new Error("useChatClosing must be used within ChatClosingProvider");
  }
  return context;
}
