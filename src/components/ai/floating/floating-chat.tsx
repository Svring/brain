import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X, MessageSquare } from "lucide-react";
import { useAiState } from "@/contexts/ai/ai-context";
import { useAiActions } from "@/contexts/ai/ai-context";
import type { Message } from "@langchain/langgraph-sdk";
import { useAiLanggraph } from "@/hooks/ai/use-ai-langgraph";

export default function FloatingChat() {
  const { messages } = useAiLanggraph();

  const {
    floatingChat: { open },
  } = useAiState();

  const { closeFloatingChat } = useAiActions();

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const rndRef = useRef<any>(null);

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);

    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  const defaultSize = { width: 350, height: 300 };

  if (!open) {
    return null;
  }

  // Don't render until window size is available
  if (windowSize.width === 0 || windowSize.height === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{ zIndex: 9999 }}
    >
      <Rnd
        ref={rndRef}
        default={{
          x: Math.max(20, windowSize.width - 370),
          y: Math.max(20, windowSize.height - 350),
          width: defaultSize.width,
          height: defaultSize.height,
        }}
        size={defaultSize}
        minWidth={250}
        minHeight={200}
        maxWidth={600}
        maxHeight={500}
        enableResizing={true}
        disableDragging={false}
        bounds="parent"
        dragHandleClassName="chat-header"
        className="shadow-lg"
        style={{ pointerEvents: "auto" }}
      >
        <Card
          className="h-full border-2 border-black "
          style={{ pointerEvents: "auto" }}
        >
          {/* Header with drag handle and buttons */}
          <CardHeader className="chat-header bg-black text-foreground p-3 flex flex-row justify-between items-center cursor-move space-y-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium text-sm">AI Chat</span>
            </div>
            <Button
              onClick={() => {
                const container = document.getElementById(
                  "floating-chat-container"
                );
                if (container) container.remove();
                closeFloatingChat();
              }}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-foreground hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="w-3 h-3" />
            </Button>
          </CardHeader>

          {/* Chat content */}
          <CardContent className="flex flex-col h-full p-0">
            <div className="flex-1 p-4 overflow-y-auto min-h-0">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">
                  No messages yet.
                </p>
              ) : (
                messages.map((msg: Message) => {
                  // Extract text content from MessageContent
                  const getTextContent = (content: any): string => {
                    if (typeof content === "string") {
                      return content;
                    }
                    if (Array.isArray(content)) {
                      return content
                        .filter((item) => item.type === "text")
                        .map((item) => item.text)
                        .join("");
                    }
                    if (
                      content &&
                      typeof content === "object" &&
                      content.text
                    ) {
                      return content.text;
                    }
                    return JSON.stringify(content);
                  };

                  return (
                    <div
                      key={msg.id}
                      className="mb-3 p-3 bg-background-secondary rounded text-sm whitespace-pre-wrap"
                    >
                      {getTextContent(msg.content)}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </Rnd>
    </div>
  );
}
