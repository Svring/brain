"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Plus, ChevronRight, Focus, History } from "lucide-react";
import {
  useCreateNewChatSessionMutation,
  useSendMessageMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Spinner } from "@/components/ui/spinner";
import { useProjectState } from "@/contexts/project/project-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import Image from "next/image";
import { useChatState } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { useThreads } from "@/hooks/langgraph/use-threads";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useReactFlow } from "@xyflow/react";

interface AiChatHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function AiChatHeader({
  title = "Chat",
  description = "Chat with Sealos Brain AI to help with your projects",
  className = "px-4 pt-2 shrink-0",
}: AiChatHeaderProps) {
  const { selectedResource } = useProjectState();
  const { selectedThreadId, sidebarChatMaximized } = useChatState();
  const { closeSidebarChat, maximizeSidebar, minimizeSidebar, selectThread } =
    useChatActions();
  const { setMessages } = useCopilotChatHeadless_c();
  const createChatMutation = useCreateNewChatSessionMutation();
  const { mutate: sendMessage } = useSendMessageMutation();

  const {
    threads,
    threadsLoading,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads,
  } = useThreads();
  const { fitView } = useReactFlow();

  // Use node select hook for resource name click functionality
  const getMessageType = (resourceType: string) => {
    switch (resourceType) {
      case "objectstoragebucket":
        return "objectstorage.detail";
      case "deployment":
      case "statefulset":
        return "launchpad.detail";
      default:
        return `${resourceType}.detail`;
    }
  };

  const { handleNodeSelect } = useNodeSelect({
    target: selectedResource as any,
    messageType: selectedResource
      ? getMessageType(selectedResource.resourceType)
      : undefined,
  });

  const getIconUrl = () => {
    if (!selectedResource) return "https://sealos.run/logo.svg";

    const defaultIcon = getResourceDefaultIcon(selectedResource.resourceType);
    return defaultIcon || "https://sealos.run/logo.svg";
  };

  const handleThreadSelect = (thread: any) => {
    // Select the thread with langgraph action
    selectThread(thread.thread_id);
  };

  const handleNewChat = () => {
    createChatMutation.mutate(undefined, {
      onSuccess: (newThread) => {
        selectThread(newThread.thread_id);
      },
      onError: (error) => {
        console.error("Failed to create new chat:", error);
      },
    });
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-lg">{title}</h2>
          {selectedResource && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Image
                src={getIconUrl()}
                alt={selectedResource.resourceType}
                width={20}
                height={20}
                className="rounded-sm"
              />
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {selectedResource.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleNewChat}
                disabled={createChatMutation.isPending}
                size="icon"
                className="h-8 w-8"
                variant="ghost"
              >
                {createChatMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[calc(100vw-2rem)] max-w-sm space-y-1"
                >
                  {selectedThreadId && (
                    <DropdownMenuItem
                      key={selectedThreadId}
                      className="flex items-center justify-between cursor-pointer p-2 bg-muted/50"
                      onClick={() => {
                        // Current thread is already selected, no action needed
                      }}
                    >
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <div className="text-sm truncate w-full">
                          {selectedThreadId}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {threads && threads.length > 0 ? (
                    threads
                      .filter((thread) => thread.thread_id !== selectedThreadId)
                      .map((thread, index) => (
                        <DropdownMenuItem
                          key={thread.thread_id}
                          className="flex items-center justify-between cursor-pointer p-2"
                          onClick={() => handleThreadSelect(thread)}
                        >
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <div className="text-sm truncate w-full">
                              {thread.thread_id}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                  ) : !selectedThreadId ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No chat history available
                    </div>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat History</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={sidebarChatMaximized}
                onPressedChange={(pressed) => {
                  if (selectedResource) {
                    // When resource is selected, toggle maximize/minimize
                    pressed ? maximizeSidebar() : minimizeSidebar();
                  } else {
                    // When no resource is selected, just fitView
                    fitView({
                      padding: 0.2,
                      duration: 300,
                      maxZoom: 1,
                    });
                  }
                }}
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
              <p>
                {selectedResource
                  ? sidebarChatMaximized
                    ? "Unfocus"
                    : "Focus"
                  : "Fit View"}
              </p>
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
            <TooltipContent>
              <p>Close</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
