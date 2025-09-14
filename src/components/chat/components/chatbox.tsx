"use client";

import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { AiMessages } from "./messages";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { cn } from "@/lib/utils";
import { useThreads } from "@/hooks/langgraph/use-threads";
import {
  useCreateNewChatSessionMutation,
  useAppendSystemMessageMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useEffect, useState } from "react";
import { useProjectState } from "@/contexts/project/project-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { Spinner } from "@/components/ui/spinner";
import SidebarSuggestions from "./sidebar-suggestions";

export default function AiChatbox() {
  const { sidebarChatOpen, selectedThreadId, pendingMessage } = useChatState();
  const { closeSidebarChat, selectThread, clearPendingMessage } =
    useChatActions();
  const { latestThreadId, hasThreads, threadsLoading, latestThread } =
    useThreads();
  const { selectedResource } = useProjectState();
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const createChatMutation = useCreateNewChatSessionMutation();
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  console.log("isLoading", isLoading);

  useEffect(() => {
    if (!sidebarChatOpen) {
      // Reset loading state when chatbox is closed
      setIsLoading(true);
      return;
    }
    
    if (threadsLoading) return;

    // Set loading to true when chatbox is opened and clear messages
    setIsLoading(true);
    setMessages([]); // Clear messages to show spinner

    const handleThread = (thread: any, isNew = false) => {
      selectThread(thread.thread_id);

      if (pendingMessage) {
        // Don't set messages yet, wait for system message to be appended
        console.log("pendingMessage", pendingMessage);
        appendSystemMessageMutation.mutate(
          {
            type: pendingMessage.messageType,
            target: pendingMessage.target,
            payload: pendingMessage.payload,
            currentMessages: convertThreadToCopilotKitMessages(thread),
          },
          {
            onSuccess: () => {
              clearPendingMessage();
              // Add a small delay to ensure spinner is visible
              setTimeout(() => {
                setIsLoading(false);
              }, 100);
            },
            onError: (error) => {
              console.error("Failed to append system message:", error);
              // On error, still show the thread messages and stop loading
              setMessages(convertThreadToCopilotKitMessages(thread));
              setIsLoading(false);
            },
          }
        );
      } else {
        // If no pending message, set messages after a brief delay to show spinner
        setTimeout(() => {
          setMessages(convertThreadToCopilotKitMessages(thread));
          setIsLoading(false);
        }, 100);
      }
    };

    if (hasThreads && latestThreadId && latestThread) {
      handleThread(latestThread);
    } else {
      createChatMutation.mutate(undefined, {
        onSuccess: (newThread) => {
          handleThread(newThread, true);
        },
        onError: (error) => {
          console.error("Failed to create new chat:", error);
          setIsLoading(false); // Set loading to false on error
        },
      });
    }
  }, [
    sidebarChatOpen,
    selectedResource,
    latestThreadId,
    latestThread,
    threadsLoading,
  ]);

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col gap-2 border rounded-xl bg-background mr-2 transition-all duration-100",
        sidebarChatOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <button
        onClick={closeSidebarChat}
        className="absolute -left-2 top-0 h-full w-2 hover:bg-muted/20 cursor-e-resize"
        aria-label="Close Chat"
      >
        <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rounded bg-muted opacity-0 hover:opacity-100" />
      </button>

      <AiChatHeader isLoading={isLoading} />
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : (
          <AiMessages />
        )}
      </div>
      
      {/* Show suggestions when no messages are present */}
      {!isLoading && messages && messages.length === 0 && (
        <div className="shrink-0">
          <SidebarSuggestions showResourceSuggestions={!!selectedResource} />
        </div>
      )}
      
      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput />
        </div>
      </div>
    </div>
  );
}
