"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Plus, ChevronRight, Focus, History, Link } from "lucide-react";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Spinner } from "@/components/ui/spinner";
import { useProjectState } from "@/contexts/project/project-context";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { useThreads } from "@/hooks/langgraph/use-threads";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReactFlow } from "@xyflow/react";

interface AiChatHeaderProps {
  title?: string;
  className?: string;
}

export function AiChatHeader({
  title = "Chat",
  className = "px-4 pt-2 shrink-0",
}: AiChatHeaderProps) {
  const { selectedResource, selectedProject } = useProjectState();
  const { selectedThreadId, sidebarChatMaximized } = useChatState();
  const { closeSidebarChat, maximizeSidebar, minimizeSidebar, selectThread } =
    useChatActions();
  const { threads } = useThreads();
  const { fitView } = useReactFlow();
  const createChatMutation = useCreateNewChatSessionMutation();
  const { setMessages } = useCopilotChatHeadless_c();

  const getIconUrl = () =>
    selectedResource
      ? getResourceDefaultIcon(selectedResource.resourceType) ||
        "https://sealos.run/logo.svg"
      : "/sealos-brain-icon-grayscale.svg";

  const handleNewChat = () =>
    createChatMutation.mutate(undefined, {
      onSuccess: (newThread) => {
        selectThread(newThread.thread_id as string);
        setMessages(convertThreadToCopilotKitMessages(newThread));
      },
    });

  const handleThreadSelect = (threadId: string): void => {
    const thread = threads?.find((t) => t.thread_id === threadId);
    if (thread) {
      selectThread(threadId);
      setMessages(convertThreadToCopilotKitMessages(thread));
    }
  };

  const formatThreadDate = (updatedAt: string): string => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const getThreadTitle = (thread: any): string => {
    try {
      // Convert thread messages to CopilotKit format first
      const convertedMessages = convertThreadToCopilotKitMessages(thread);
      
      // Find the first message from either human or assistant
      const firstMessage = convertedMessages.find(
        (msg: any) => msg.role === "user" || msg.role === "assistant"
      );
      
      if (firstMessage?.content) {
        // Truncate the content to a reasonable length for display
        const content = String(firstMessage.content);
        return content.length > 50 ? content.substring(0, 50) + "..." : content;
      }
    } catch (error) {
      console.warn("Failed to convert thread messages:", error);
    }
    
    // Display "New Thread" if no message found or conversion fails
    return "New Thread";
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-foreground text-lg">{title}</h2>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleNewChat}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-w-xs space-y-1">
                  {selectedThreadId && (
                    <DropdownMenuItem className="p-2 bg-muted/50 cursor-pointer border border-theme-blue/30 rounded-md">
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="text-sm font-medium truncate flex-1 max-w-[200px]">
                          {(() => {
                            const selectedThread = threads?.find(
                              (t) => t.thread_id === selectedThreadId
                            );
                            return selectedThread ? getThreadTitle(selectedThread) : "New Thread";
                          })()}
                        </div>
                        {(() => {
                          const selectedThread = threads?.find(
                            (t) => t.thread_id === selectedThreadId
                          );
                          return selectedThread ? (
                            <div className="text-xs text-muted-foreground shrink-0 max-w-[60px]">
                              {selectedThread.updated_at
                                ? formatThreadDate(selectedThread.updated_at)
                                : "Unknown"}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </DropdownMenuItem>
                  )}
                  {threads?.filter((t) => t.thread_id !== selectedThreadId)
                    .length
                    ? threads
                        .filter((t) => t.thread_id !== selectedThreadId)
                        .map((thread) => (
                          <DropdownMenuItem
                            key={thread.thread_id}
                            onClick={() => handleThreadSelect(thread.thread_id)}
                            className="p-2 cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="text-sm font-medium truncate flex-1 max-w-[200px]">
                                {getThreadTitle(thread)}
                              </div>
                              <div className="text-xs text-muted-foreground shrink-0 max-w-[60px]">
                                {thread.updated_at
                                  ? formatThreadDate(thread.updated_at)
                                  : "Unknown"}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                    : !selectedThreadId && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No chat history available
                        </div>
                      )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>Chat History</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={sidebarChatMaximized}
                onPressedChange={(pressed) =>
                  selectedResource
                    ? pressed
                      ? maximizeSidebar()
                      : minimizeSidebar()
                    : fitView({ padding: 0.2, duration: 300, maxZoom: 1 })
                }
                size="sm"
                className={cn(
                  "h-8 w-8 hover:text-theme-blue",
                  sidebarChatMaximized && "text-theme-blue"
                )}
              >
                <Focus className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {selectedResource
                ? sidebarChatMaximized
                  ? "Unfocus"
                  : "Focus"
                : "Fit View"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={closeSidebarChat}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {(selectedResource || selectedProject) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 mt-2 px-3 py-2 border border-border rounded-md bg-muted/30">
              <Image
                src={getIconUrl()}
                alt={selectedResource?.resourceType || "Sealos Brain"}
                width={16}
                height={16}
                className={cn("rounded-sm", !selectedResource && "grayscale")}
              />
              <span className="text-sm text-muted-foreground truncate">
                {selectedResource?.name || selectedProject}
              </span>
              <Link className="h-3 w-3 text-theme-blue" />
              <span className="text-sm truncate text-theme-blue">
                Connected
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="p-2 text-sm"
            style={{ width: "var(--radix-tooltip-trigger-width)" }}
            side="bottom"
            align="start"
          >
            Agent would focuse on {selectedResource?.name || selectedProject}{" "}
            context and operations.
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
