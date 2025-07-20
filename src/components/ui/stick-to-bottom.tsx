"use client";

import React, { useEffect, useRef, useState, useCallback, useContext } from "react";
import { cn } from "@/lib/utils";

interface StickToBottomProps {
  children: React.ReactNode;
  className?: string;
  resize?: "smooth" | "instant";
  initial?: "smooth" | "instant";
}

interface StickToBottomContentProps {
  children: React.ReactNode;
  className?: string;
}

const StickToBottomContext = React.createContext<{
  scrollToBottom: () => void;
}>({ scrollToBottom: () => {} });

export function StickToBottom({
  children,
  className,
  resize = "smooth",
  initial = "smooth",
}: StickToBottomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = resize === "smooth" ? "smooth" : "auto") => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior,
        });
      }
    },
    [resize]
  );

  const checkIfAtBottom = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const threshold = 10; // 10px threshold
      const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
      setIsAtBottom(atBottom);
      setShouldAutoScroll(atBottom);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial scroll
    scrollToBottom(initial === "smooth" ? "smooth" : "auto");

    // Set up scroll listener
    container.addEventListener("scroll", checkIfAtBottom);
    
    // Set up resize observer to handle content changes
    const resizeObserver = new ResizeObserver(() => {
      if (shouldAutoScroll) {
        scrollToBottom();
      }
    });

    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", checkIfAtBottom);
      resizeObserver.disconnect();
    };
  }, [checkIfAtBottom, scrollToBottom, shouldAutoScroll, initial]);

  // Auto-scroll when content changes and user is at bottom
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  });

  return (
    <StickToBottomContext.Provider value={{ scrollToBottom }}>
      <div
        ref={containerRef}
        className={cn("overflow-y-auto", className)}
        onScroll={checkIfAtBottom}
      >
        {children}
      </div>
    </StickToBottomContext.Provider>
  );
}

StickToBottom.Content = function StickToBottomContent({
  children,
  className,
}: StickToBottomContentProps) {
  return <div className={cn("min-h-full", className)}>{children}</div>;
};

export function useStickToBottom() {
  const context = useContext(StickToBottomContext);
  if (!context) {
    throw new Error("useStickToBottom must be used within StickToBottom");
  }
  return context;
}