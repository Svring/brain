"use client";

import { useProjectState } from "@/contexts/project/project-context";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useState, useRef, useEffect } from "react";
import { HeaderActions } from "./header/header-actions";
import { ResourceStatusRow } from "./header/resource-status-row";
import { useThreads } from "@/hooks/langgraph/use-threads";

interface AiChatHeaderProps {
  title?: string;
  className?: string;
  isLoading?: boolean;
}

export function AiChatHeader({
  title = "Chat",
  className = "px-4 pt-2 shrink-0",
  isLoading = false,
}: AiChatHeaderProps) {
  const { selectedResource, selectedProject } = useProjectState();
  const { selectThread } = useChatActions();
  const { createNewThread } = useThreads();
  const [isDetailPopoverOpen, setIsDetailPopoverOpen] = useState(false);

  const handleNewChat = () =>
    createNewThread.mutate(undefined, {
      onSuccess: (newThread) => {
        console.log("newThread", newThread);
        selectThread(newThread.thread_id as string);
      },
    });

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-foreground text-lg">{title}</h2>
        <HeaderActions onNewChat={handleNewChat} />
      </div>

      <ResourceStatusRow
        selectedResource={selectedResource}
        selectedProject={selectedProject}
        isDetailPopoverOpen={isDetailPopoverOpen}
        onDetailPopoverChange={setIsDetailPopoverOpen}
      />
    </div>
  );
}
