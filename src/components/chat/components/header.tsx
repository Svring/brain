"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Plus,
  ChevronRight,
  Focus,
  History,
  Link,
  Trash2,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import {
  useCreateNewChatSessionMutation,
  useDeleteThreadMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { useThreads } from "@/hooks/langgraph/use-threads";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useReactFlow } from "@xyflow/react";
import { useState, useRef, useEffect } from "react";
import { SystemMessageType } from "@/components/chat/messages/system-messages.tsx/systemp-message-types";
import { useQueryClient } from "@tanstack/react-query";

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
  const { selectedThreadId, sidebarChatMaximized } = useChatState();
  const { closeSidebarChat, maximizeSidebar, minimizeSidebar, selectThread } =
    useChatActions();
  const { threads } = useThreads();
  const { fitView } = useReactFlow();
  const createChatMutation = useCreateNewChatSessionMutation();
  const deleteThreadMutation = useDeleteThreadMutation();
  const { setMessages, messages } = useCopilotChatHeadless_c();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDetailPopoverOpen, setIsDetailPopoverOpen] = useState(false);
  const previousMessagesLengthRef = useRef<number | null>(null);

  // Auto-open when a resource is selected and there are no messages
  useEffect(() => {
    if (selectedResource && !isLoading && (messages?.length || 0) === 0) {
      setIsDetailPopoverOpen(true);
    }
  }, [selectedResource, isLoading, messages]);

  // Auto-close only when messages length changes (and is non-empty)
  useEffect(() => {
    const currentLength = messages?.length || 0;
    const previousLength = previousMessagesLengthRef.current;
    if (
      previousLength !== null &&
      previousLength !== currentLength &&
      currentLength > 0
    ) {
      setIsDetailPopoverOpen(false);
    }
    previousMessagesLengthRef.current = currentLength;
  }, [messages]);

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

  const handleHistoryDropdownHover = () => {
    // Refetch threads when hovering over the history dropdown
    queryClient.refetchQueries({
      queryKey: ["langgraph", "threads", "search"],
    });
  };

  const handleThreadSelect = (threadId: string): void => {
    const thread = threads?.find((t) => t.thread_id === threadId);
    if (thread) {
      selectThread(threadId);
      setMessages(convertThreadToCopilotKitMessages(thread));
    }
  };

  const handleDeleteThread = (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent thread selection when clicking delete
    setThreadToDelete(threadId);
    setDeleteDialogOpen(true);
    setDropdownOpen(false); // Close the dropdown menu
  };

  const confirmDeleteThread = () => {
    if (threadToDelete) {
      deleteThreadMutation.mutate(threadToDelete, {
        onSuccess: () => {
          // If we deleted the currently selected thread, select the latest remaining thread
          if (threadToDelete === selectedThreadId) {
            const remainingThreads = threads?.filter(
              (t) => t.thread_id !== threadToDelete
            );
            if (remainingThreads && remainingThreads.length > 0) {
              // Sort by updated_at to get the latest thread
              const latestThread = remainingThreads.sort(
                (a, b) =>
                  new Date(b.updated_at || 0).getTime() -
                  new Date(a.updated_at || 0).getTime()
              )[0];
              selectThread(latestThread.thread_id);
              setMessages(convertThreadToCopilotKitMessages(latestThread));
            } else {
              // No threads left, create a new one
              createChatMutation.mutate(undefined, {
                onSuccess: (newThread) => {
                  selectThread(newThread.thread_id as string);
                  setMessages(convertThreadToCopilotKitMessages(newThread));
                },
              });
            }
          }
        },
      });
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
    }
  };

  const cancelDeleteThread = () => {
    setDeleteDialogOpen(false);
    setThreadToDelete(null);
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

  const renderDetailCard = () => {
    if (!selectedResource) return null;

    const resourceType = selectedResource.resourceType.toLowerCase();

    // Get the appropriate detail component based on resource type
    let DetailComponent = null;

    switch (resourceType) {
      case "devbox":
        DetailComponent = SystemMessageType.devbox.detail(
          selectedResource as any
        );
        break;
      case "cluster":
        DetailComponent = SystemMessageType.cluster.detail(
          selectedResource as any
        );
        break;
      case "deployment":
        DetailComponent = SystemMessageType.launchpad.detail(
          selectedResource as any
        );
        break;
      case "statefulset":
        DetailComponent = SystemMessageType.launchpad.detail(
          selectedResource as any
        );
        break;
      case "objectstoragebucket":
        DetailComponent = SystemMessageType.objectstorage.detail(
          selectedResource as any
        );
        break;
      default:
        return null;
    }

    return (
      <div className="max-h-[500px] overflow-y-auto">{DetailComponent}</div>
    );
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
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onMouseEnter={handleHistoryDropdownHover}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-w-xs space-y-1">
                  {threads?.length ? (
                    threads.map((thread) => (
                      <DropdownMenuItem
                        key={thread.thread_id}
                        onClick={() => handleThreadSelect(thread.thread_id)}
                        className={cn(
                          "p-2 cursor-pointer",
                          thread.thread_id === selectedThreadId &&
                            "bg-muted/50 border border-theme-blue/30 rounded-md"
                        )}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="text-sm font-medium truncate flex-1 max-w-[200px]">
                            {getThreadTitle(thread)}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground shrink-0 max-w-[60px]">
                              {thread.updated_at
                                ? formatThreadDate(thread.updated_at)
                                : "Unknown"}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) =>
                                handleDeleteThread(thread.thread_id, e)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
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
        <div className="mt-2">
          {selectedResource ? (
            <Popover
              open={isDetailPopoverOpen}
              onOpenChange={setIsDetailPopoverOpen}
            >
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors select-none"
                  )}
                >
                  <div className="flex items-center">
                    {isDetailPopoverOpen ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <Image
                    src={getIconUrl()}
                    alt={selectedResource?.resourceType || "Sealos Brain"}
                    width={16}
                    height={16}
                    className="rounded-sm"
                  />
                  <span className="text-sm text-muted-foreground truncate">
                    {selectedResource?.name}
                  </span>
                  <Link className="h-3 w-3 text-theme-blue" />
                  <span className="text-sm truncate text-theme-blue">
                    Connected
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 rounded-xl"
                align="start"
                side="bottom"
                sideOffset={5}
                style={{
                  width: "var(--radix-popover-trigger-width)",
                }}
              >
                {renderDetailCard()}
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted/30">
              <Image
                src={getIconUrl()}
                alt="Sealos Brain"
                width={16}
                height={16}
                className="grayscale rounded-sm"
              />
              <span className="text-sm text-muted-foreground truncate">
                {selectedProject}
              </span>
              <Link className="h-3 w-3 text-theme-blue" />
              <span className="text-sm truncate text-theme-blue">
                Connected
              </span>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat thread? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteThread}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteThread}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
