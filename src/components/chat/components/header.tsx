"use client";

import { useProjectState } from "@/contexts/project/project-context";
import { useState } from "react";
import { HeaderActions } from "./header/header-actions";
import { ResourceStatusRow } from "./header/resource-status-row";
import { useThreads } from "@/components/provider/thread-provider";

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
  const { createNewThread, selectThread } = useThreads();
  const [isDetailPopoverOpen, setIsDetailPopoverOpen] = useState(false);

  const handleNewChat = () =>
    createNewThread.mutate(undefined, {
      onSuccess: (newThread: any) => {
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
