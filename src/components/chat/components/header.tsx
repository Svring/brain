"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Plus, ChevronRight, Focus, History, Link } from "lucide-react";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Spinner } from "@/components/ui/spinner";
import { useProjectState } from "@/contexts/project/project-context";
import { useChatActions } from "@/contexts/chat/chat-context";
import Image from "next/image";
import { useChatState } from "@/contexts/chat/chat-context";
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
  const createChatMutation = useCreateNewChatSessionMutation();

  const { threads } = useThreads();
  const { fitView } = useReactFlow();

  const getIconUrl = () => {
    if (!selectedResource) return "https://sealos.run/logo.svg";
    return (
      getResourceDefaultIcon(selectedResource.resourceType) ||
      "https://sealos.run/logo.svg"
    );
  };

  const handleThreadSelect = (thread: any) => {
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
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-lg">{title}</h2>
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
                      onClick={() => {}}
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
                      .map((thread) => (
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
                    pressed ? maximizeSidebar() : minimizeSidebar();
                  } else {
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

      {(selectedResource || selectedProject) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-between gap-2 mt-2 px-3 py-2 border border-border rounded-md bg-muted/30">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedResource ? (
                  <>
                    <Image
                      src={getIconUrl()}
                      alt={selectedResource.resourceType}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    <span className="text-sm text-muted-foreground truncate">
                      {selectedResource.name}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link className="h-3 w-3 text-theme-blue" />
                      <span className="text-xs text-theme-blue">Connected</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Image
                      src="/sealos-brain-icon-grayscale.svg"
                      alt="Sealos Brain"
                      width={16}
                      height={16}
                      className="rounded-sm grayscale"
                    />
                    <span className="text-sm text-muted-foreground truncate">
                      {selectedProject}
                    </span>
                  </>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="p-2 text-sm"
            style={{
              width: "var(--radix-tooltip-trigger-width)",
            }}
            side="bottom"
            align="start"
          >
            <p>
              once connected, agent would focus on the context and operations of
              a single resource
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
