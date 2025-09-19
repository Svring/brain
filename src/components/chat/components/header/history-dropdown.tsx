"use client";

import { Button } from "@/components/ui/button";
import { History, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThreads } from "@/components/provider/thread-provider";
import { useState } from "react";
import { DeleteThreadDialog } from "./delete-thread-dialog";
import { Message, Thread } from "@langchain/langgraph-sdk";
import { Spinner } from "@/components/ui/spinner";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";

export function HistoryDropdown() {
  const {
    selectedThreadId,
    selectThread,
    threads,
    deleteThread,
    threadsLoading,
  } = useThreads();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  const handleThreadSelect = async (threadId: string): Promise<void> => {
    // Select the thread first
    selectThread(threadId);
  };

  console.log("threads", threads);

  const handleDeleteThread = (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent thread selection when clicking delete
    setThreadToDelete(threadId);
    setDeleteDialogOpen(true);
    setDropdownOpen(false); // Close the dropdown menu
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

  const getThreadTitle = (thread: Thread): string => {
    try {
      // Find the first message from either human or ai
      const firstMessage = (thread.values as any)?.messages?.find(
        (msg: Message) => msg.type === "human" || msg.type === "ai"
      );

      if (firstMessage?.content) {
        // Truncate the content to a reasonable length for display
        const content = String(firstMessage.content);
        return content.length > 50 ? content.substring(0, 50) + "..." : content;
      }
    } catch (error) {
      console.warn("Failed to get thread title:", error);
    }

    // Display "New Thread" if no message found or conversion fails
    return "New Thread";
  };

  const getThreadResourceInfo = (
    thread: Thread
  ): { type: string; name: string } | null => {
    try {
      // Check thread metadata for resource information
      const metadata = (thread as any)?.metadata;

      // Parse resourceTarget from metadata
      if (metadata?.resourceTarget) {
        try {
          const resourceTarget = JSON.parse(metadata.resourceTarget);
          if (resourceTarget?.resourceType && resourceTarget?.name) {
            return {
              type: resourceTarget.resourceType,
              name: resourceTarget.name,
            };
          }
        } catch (parseError) {
          console.warn("Failed to parse resourceTarget:", parseError);
        }
      }

      // Fallback to direct resource_name
      if (metadata?.resource_name) {
        return {
          type: "resource",
          name: metadata.resource_name,
        };
      }

      // Check if resource context is stored in thread values
      const resourceContext = (thread.values as any)?.resource_context;
      if (resourceContext?.selectedResource?.name) {
        return {
          type: resourceContext.selectedResource.type || "resource",
          name: resourceContext.selectedResource.name,
        };
      }

      // Check project context for resource info
      const projectContext = (thread.values as any)?.project_context;
      if (projectContext?.selectedProjectResources?.length > 0) {
        const resource = projectContext.selectedProjectResources[0];
        return {
          type: resource.type || "resource",
          name: resource.name,
        };
      }
    } catch (error) {
      console.warn("Failed to get thread resource info:", error);
    }

    return null;
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-xs space-y-1">
              {threadsLoading ? (
                <div className="p-2 text-sm text-muted-foreground text-center flex items-center justify-center">
                  <Spinner size={16} />
                  <span className="ml-2">Loading threads...</span>
                </div>
              ) : threads?.length ? (
                threads.map((thread) => {
                  const resourceInfo = getThreadResourceInfo(thread);
                  const resourceIcon = resourceInfo
                    ? getResourceDefaultIcon(resourceInfo.type)
                    : null;

                  return (
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
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                <img
                                  src={
                                    resourceIcon ||
                                    "/sealos-brain-icon-grayscale.svg"
                                  }
                                  alt={
                                    resourceInfo
                                      ? "Resource icon"
                                      : "Sealos Brain"
                                  }
                                  className="w-4 h-4"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                {resourceInfo ? (
                                  <>
                                    <div className="font-medium">
                                      {resourceInfo.type}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {resourceInfo.name}
                                    </div>
                                  </>
                                ) : (
                                  <div className="font-medium">
                                    General Chat
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <div className="text-sm font-medium truncate flex-1 min-w-0">
                            {getThreadTitle(thread)}
                          </div>
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
                            disabled={deleteThread.isPending}
                          >
                            {deleteThread.isPending ? (
                              <Spinner variant="ellipsis" size={12} />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })
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

      <DeleteThreadDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        threadToDelete={threadToDelete}
        onConfirm={() => {
          if (threadToDelete) {
            deleteThread.mutate(threadToDelete);
            setDeleteDialogOpen(false);
            setThreadToDelete(null);
          }
        }}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setThreadToDelete(null);
        }}
      />
    </>
  );
}
