"use client";

import { RenderTextMessage } from "./messages/text-message";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { SystemMessageType } from "./messages/system-messages.tsx/systemp-message-types";
import { get } from "lodash";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function AiMessages() {
  const { messages, isLoading, interrupt } = useCopilotChatHeadless_c({
    id: "chat",
  });

  const { scrollRef, isAtBottom, scrollToBottom } = useAutoScroll({
    offset: 20,
    smooth: true,
    content: messages.length,
  });

  // console.log("messages", messages);

  return (
    <>
      {messages.length !== 0 && (
        <div className="w-full px-4 py-0 pb-4 h-full relative">
          <div ref={scrollRef} className="h-full overflow-y-auto">
            {messages.map((message, index) => {
              const isCurrentMessage = index === messages.length - 1;

              return (
                <div key={message.id} className="mb-2">
                  <RenderTextMessage message={message} inProgress={isLoading} />

                  {/* Generative UI for assistant messages */}
                  {message.role === "assistant" && message.generativeUI?.()}

                  {message.role === "system" &&
                    message.content &&
                    (() => {
                      const systemData = JSON.parse(message.content);
                      const { type, payload } = systemData;

                      if (type && payload) {
                        const componentFunction = get(SystemMessageType, type);

                        if (typeof componentFunction === "function") {
                          return componentFunction(payload);
                        }
                      }

                      return null;
                    })()}
                </div>
              );
            })}
          </div>

          {!isAtBottom && (
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-4 right-4 rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {interrupt}
    </>
  );
}
