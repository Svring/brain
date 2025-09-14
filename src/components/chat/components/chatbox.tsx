"use client";

import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { AiChatInput } from "./input";
import { AiChatHeader } from "./header";
import { AiMessages } from "./messages";
import { cn } from "@/lib/utils";
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useUpdateThreadStateMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { listThreadsOptions } from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useQuery } from "@tanstack/react-query";
import { useProjectState } from "@/contexts/project/project-context";

export default function AiChatbox() {
  const { sidebarChatOpen, selectedThreadId } = useChatState();
  const { apiKey, baseUrl, modelName, stage } = useLanggraphState();
  const { mutate: updateThreadState } = useUpdateThreadStateMutation();
  const {
    selectedProject,
    selectedResource,
    selectedProjectResources,
    selectedResourceContext,
  } = useProjectState();

  const { data: threads } = useQuery(listThreadsOptions());

  const [threadId, setThreadId] = useQueryState("threadId", {
    defaultValue: selectedThreadId || threads?.[0]?.thread_id || "",
  });

  const { isLoading, stop, messages, values, submit } = useStream<{
    messages: Message[];
    api_key: string;
    base_url: string;
    model_name: string;
  }>({
    apiUrl: "http://localhost:2025",
    assistantId: "orca",
    messagesKey: "messages",
    threadId: threadId,
  });

  useEffect(() => {
    if (apiKey && baseUrl && modelName && stage) {
      updateThreadState({
        threadId: threadId,
        state: {
          values: {
            api_key: apiKey,
            base_url: baseUrl,
            model_name: modelName,
            stage: stage,
            project_context: {
              selectedProject,
              selectedProjectResources,
            },
            resource_context: selectedResource
              ? {
                  selectedResource,
                  selectedResourceContext,
                }
              : undefined,
          },
          as_node: "entry_node",
        },
      });
    }
  }, [
    threadId,
    apiKey,
    baseUrl,
    modelName,
    stage,
    selectedProject,
    selectedProjectResources,
    selectedResource,
    selectedResourceContext,
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
      <AiChatHeader isLoading={false} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <AiMessages messages={messages} isLoading={isLoading} />
      </div>

      <div className="p-2 pt-0 shrink-0 relative z-[9999]">
        <div className="max-w-3xl mx-auto">
          <AiChatInput submit={submit} stop={stop} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
