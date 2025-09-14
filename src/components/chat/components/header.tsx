"use client";

import { useProjectState } from "@/contexts/project/project-context";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useState, useRef, useEffect } from "react";
import { HeaderActions } from "./header/header-actions";
import { ResourceStatusRow } from "./header/resource-status-row";

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
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const createChatMutation = useCreateNewChatSessionMutation();
  const [isDetailPopoverOpen, setIsDetailPopoverOpen] = useState(false);
  const previousMessagesLengthRef = useRef<number | null>(null);

  // Auto-open when a resource is selected and there are no messages
  // useEffect(() => {
  //   if (selectedResource && !isLoading && (messages?.length || 0) === 0) {
  //     setIsDetailPopoverOpen(true);
  //   }
  // }, [selectedResource, isLoading, messages]);

  // Auto-close only when messages length changes (and is non-empty)
  // useEffect(() => {
  //   const currentLength = messages?.length || 0;
  //   const previousLength = previousMessagesLengthRef.current;
  //   if (
  //     previousLength !== null &&
  //     previousLength !== currentLength &&
  //     currentLength > 0
  //   ) {
  //     setIsDetailPopoverOpen(false);
  //   }
  //   previousMessagesLengthRef.current = currentLength;
  // }, [messages]);

  const handleNewChat = () =>
    createChatMutation.mutate(undefined, {
      onSuccess: (newThread) => {
        selectThread(newThread.thread_id as string);
        setMessages(convertThreadToCopilotKitMessages(newThread));
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
