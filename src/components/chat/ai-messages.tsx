"use client";

import { RenderTextMessage } from "./messages";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { SystemMessageType } from "./messages/system-messages.tsx/systemp-message-types";
import { get } from "lodash";

export function AiMessages() {
  const { messages, isLoading, interrupt } = useCopilotChatHeadless_c({
    id: "chat",
  });

  console.log("messages", messages);

  return (
    <>
      {messages.length !== 0 && (
        <div className="w-full px-4 py-0 pb-4 h-full">
          {messages.map((message, index) => {
            const isCurrentMessage = index === messages.length - 1;

            return (
              <div key={message.id} className="mb-2">
                <RenderTextMessage
                  message={message}
                  index={index}
                  isCurrentMessage={isCurrentMessage}
                  inProgress={isLoading}
                />

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
      )}
      {interrupt}
    </>
  );
}
