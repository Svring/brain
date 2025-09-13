"use client";

import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { AiMessages } from "./messages";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { cn } from "@/lib/utils";
import { useThreads } from "@/hooks/langgraph/use-threads";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useEffect } from "react";
import { useProjectState } from "@/contexts/project/project-context";
import { useMount } from "@reactuses/core";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

export default function AiChatbox() {
  const { sidebarChatOpen, selectedThreadId } = useChatState();
  const { closeSidebarChat, selectThread } = useChatActions();
  const { latestThreadId, hasThreads, threadsLoading, latestThread } =
    useThreads();
  const createChatMutation = useCreateNewChatSessionMutation();
  const { selectedResource } = useProjectState();
  const { setMessages } = useCopilotChatHeadless_c();

  // Handle thread selection/creation when chatbox opens
  useEffect(() => {
    if (sidebarChatOpen && !threadsLoading) {
      if (hasThreads && latestThreadId && latestThread) {
        // Select the latest thread if available
        selectThread(latestThreadId);
        setMessages(convertThreadToCopilotKitMessages(latestThread));
      } else {
        // Create a new thread if none exists
        createChatMutation.mutate(undefined, {
          onSuccess: (newThread) => {
            // console.log("newThread", newThread);
            setMessages(convertThreadToCopilotKitMessages(newThread));
            selectThread(newThread.thread_id);
          },
          onError: (error) => {
            console.error("Failed to create new chat:", error);
          },
        });
      }
    }
  }, [sidebarChatOpen, selectedResource, latestThreadId, latestThread]);

  return (
    <div
      className={cn(
        "h-full w-full p-0 flex flex-col gap-2 border rounded-xl bg-background relative transition-all duration-100 ease-in-out transform mr-2",
        sidebarChatOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      {/* Left rail for closing the chat */}
      <button
        onClick={closeSidebarChat}
        className="absolute -left-2 top-0 z-50 h-full w-2 bg-transparent transition-colors group/rail cursor-e-resize hover:bg-muted/20"
        title="Close Chat"
        aria-label="Close Chat"
      >
        <span className="pointer-events-none absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rounded bg-muted opacity-0 transition-opacity group-hover/rail:opacity-100" />
      </button>

      <AiChatHeader />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages />
      </div>

      <div className="p-2 pt-0 shrink-0">
        <div className="max-w-3xl mx-auto">
          <AiChatInput />
        </div>
      </div>
    </div>
  );
}
