"use client";

import { useEffect } from "react";
import { useChatInstance } from "@/components/provider/chat-instance-provider";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { AiMessages } from "./messages";
import SidebarSuggestions from "./sidebar-suggestions";
import { cn } from "@/lib/utils";

interface AiChatboxProps {
  showResourceDetails?: boolean;
}

export default function AiChatbox({ showResourceDetails = false }: AiChatboxProps) {
  const {
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

  useEffect(() => {
    const shouldTrigger = shouldTriggerPendingMessages(resourceTarget);
    if (shouldTrigger) {
      const pendingMessages = getPendingMessages(resourceTarget);
      if (pendingMessages.length > 0) {
        try {
          submit({
            messages: pendingMessages,
          });
          clearPendingMessages(resourceTarget);
        } catch (error) {
          // Failed to submit pending messages
        }
      }
      clearTriggerPendingMessages(resourceTarget);
    }
  }, [shouldTriggerPendingMessages, resourceTarget]);

  return (
    <div className="h-full w-full flex flex-col bg-transparent">
      <AiChatHeader showResourceDetails={showResourceDetails} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages
          messages={messages}
          isLoading={isLoading}
          interrupt={interrupt}
          submit={submit}
        />
      </div>

      {messages && messages.length === 0 && (
        <div className="p-2 pb-0 shrink-0">
          <div className="max-w-3xl mx-auto">
            <SidebarSuggestions
              submit={submit}
              showResourceSuggestions={!!resourceTarget}
            />
          </div>
        </div>
      )}

      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput 
            onSubmit={submit} 
            onStop={stop} 
            isLoading={isLoading}
            interrupt={interrupt}
            submit={submit}
          />
        </div>
      </div>
    </div>
  );
}