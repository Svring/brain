"use client";

import { useEffect } from "react";
import { useChatInstance } from "@/components/provider/chat-instance-provider";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { AiMessages } from "./messages";
import { cn } from "@/lib/utils";

export default function AiChatbox() {
  const {
    isActive,
    isFocused,
    state,
    resourceTarget,
    submit,
    stop,
    isLoading,
    messages,
    interrupt,
  } = useChatInstance();

  const { getPendingMessages, shouldTriggerPendingMessages } = useChatState();
  const { clearPendingMessages, clearTriggerPendingMessages } =
    useChatActions();

  // Check if we should trigger pending messages and submit them
  useEffect(() => {
    const shouldTrigger = shouldTriggerPendingMessages(resourceTarget);
    if (shouldTrigger) {
      const pendingMessages = getPendingMessages(resourceTarget);
      if (pendingMessages.length > 0) {
        console.log("AiChatbox - Pending messages for resource target:", {
          resourceTarget,
          pendingMessageCount: pendingMessages.length,
          pendingMessages,
        });

        // Submit the pending messages
        try {
          submit({
            messages: pendingMessages,
          });
          console.log(
            "AiChatbox - Successfully submitted pending messages:",
            pendingMessages.length
          );

          // Clear the pending messages after successful submission
          clearPendingMessages(resourceTarget);
          console.log(
            "AiChatbox - Cleared pending messages for resource target:",
            resourceTarget
          );
        } catch (error) {
          console.error(
            "AiChatbox - Failed to submit pending messages:",
            error
          );
        }
      }

      // Clear the trigger after processing
      clearTriggerPendingMessages(resourceTarget);
      console.log(
        "AiChatbox - Cleared trigger for resource target:",
        resourceTarget
      );
    }
  }, [shouldTriggerPendingMessages]);

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100",
        state.open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <AiChatHeader />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages
          messages={messages}
          isLoading={isLoading}
          interrupt={interrupt}
          submit={submit}
        />
      </div>

      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput onSubmit={submit} onStop={stop} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
