"use client";

import { useState, useEffect, useRef } from "react";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

export function useAiCacheMessages() {
  const { messages, setMessages, isLoading, interrupt } =
    useCopilotChatHeadless_c({ id: "chat" });

  const [cachedMessages, setCachedMessages] = useState(messages);
  const prevVisibleLengthRef = useRef(messages.length);

  useEffect(() => {
    const currentLength = messages.length;
    const cachedLength = cachedMessages.length;

    // Calculate total content length for both message arrays
    const getContentLength = (messages: any[]) => {
      return messages.reduce((total, message) => {
        const content = message.content || message.text || "";
        return total + (typeof content === "string" ? content.length : 0);
      }, 0);
    };

    const visibleContentLength = getContentLength(messages);
    const cachedContentLength = getContentLength(cachedMessages);

    if (
      currentLength > cachedLength ||
      visibleContentLength > cachedContentLength
    ) {
      // Sync visibleMessages to cachedMessages if it has more messages or longer content
      setCachedMessages(messages);
    } else if (
      currentLength < prevVisibleLengthRef.current ||
      cachedContentLength > visibleContentLength
    ) {
      // Sync cachedMessages back to visibleMessages if visible decreased or cached has longer content
      setMessages(cachedMessages);
    }

    prevVisibleLengthRef.current = currentLength;
  }, [messages, setMessages, cachedMessages]);

  // Filter out system messages and deduplicate by id
  const filteredMessages = cachedMessages
    .filter((message) => message.role !== "system")
    .filter((message, index, array) => {
      // Keep only the first occurrence of each id
      return array.findIndex((m) => m.id === message.id) === index;
    });

  return {
    messages: filteredMessages,
    isLoading,
    interrupt,
    cachedMessages,
    cachedMessagesLength: cachedMessages.length,
  };
}
