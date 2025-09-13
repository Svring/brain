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
import { useEffect } from "react";
import { useProjectState } from "@/contexts/project/project-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";

export default function AiChatbox() {
  const { sidebarChatOpen, selectedThreadId } = useChatState();
  const {
    closeSidebarChat,
    selectThread,
    readFirstPendingMessage,
    removePendingMessage,
  } = useChatActions();
  const { latestThreadId, hasThreads, threadsLoading, latestThread } =
    useThreads();
  const { selectedResource } = useProjectState();
  const { setMessages } = useCopilotChatHeadless_c();
  const createChatMutation = useCreateNewChatSessionMutation();
  const appendSystemMessageMutation = useAppendSystemMessageMutation();

  useEffect(() => {
    if (!sidebarChatOpen || threadsLoading) return;

    const handleThread = (thread: any, isNew = false) => {
      selectThread(thread.thread_id);
      setMessages(convertThreadToCopilotKitMessages(thread));
      const firstMessage = readFirstPendingMessage();
      if (firstMessage) {
        appendSystemMessageMutation.mutate(
          {
            type: firstMessage.messageType,
            target: firstMessage.target,
            payload: firstMessage.payload,
            currentMessages: convertThreadToCopilotKitMessages(thread),
          },
          {
            onSuccess: () => {
              removePendingMessage();
            },
          }
        );
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
        },
      });
    }
  }, [sidebarChatOpen, selectedResource, latestThreadId, latestThread]);

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
