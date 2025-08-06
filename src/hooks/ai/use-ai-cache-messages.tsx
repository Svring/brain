"use client";

import { useState, useEffect, useRef } from "react";
import { useCopilotChat } from "@copilotkit/react-core";

export function useAiCacheMessages() {
  const { visibleMessages, setMessages, isLoading, interrupt } = useCopilotChat(
    { id: "chat" }
  );
  const [cachedMessages, setCachedMessages] = useState(visibleMessages);
  const prevVisibleLengthRef = useRef(visibleMessages.length);

  useEffect(() => {
    const currentLength = visibleMessages.length;
    const cachedLength = cachedMessages.length;

    // Calculate total content length for both message arrays
    const getContentLength = (messages: any[]) => {
      return messages.reduce((total, message) => {
        const content = message.content || message.text || "";
        return total + (typeof content === "string" ? content.length : 0);
      }, 0);
    };

    const visibleContentLength = getContentLength(visibleMessages);
    const cachedContentLength = getContentLength(cachedMessages);

    if (
      currentLength > cachedLength ||
      visibleContentLength > cachedContentLength
    ) {
      // Sync visibleMessages to cachedMessages if it has more messages or longer content
      setCachedMessages(visibleMessages);
    } else if (
      currentLength < prevVisibleLengthRef.current ||
      cachedContentLength > visibleContentLength
    ) {
      // Sync cachedMessages back to visibleMessages if visible decreased or cached has longer content
      setMessages(cachedMessages);
    }

    prevVisibleLengthRef.current = currentLength;
  }, [visibleMessages, setMessages, cachedMessages]);

  // Filter out system messages and deduplicate by id
  const messages = cachedMessages
    .filter((message) => message.role !== "system")
    .filter((message, index, array) => {
      // Keep only the first occurrence of each id
      return array.findIndex((m) => m.id === message.id) === index;
    });

  return {
    messages,
    isLoading,
    interrupt,
    cachedMessages,
    cachedMessagesLength: cachedMessages.length,
  };
}
