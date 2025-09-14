"use client";

import { Button } from "@/components/ui/button";
import { History, Trash2 } from "lucide-react";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
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
import { useThreads } from "@/hooks/langgraph/use-threads";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DeleteThreadDialog } from "./delete-thread-dialog";
import { Message, Thread } from "@langchain/langgraph-sdk";

export function HistoryDropdown() {
  const { selectedThreadId } = useChatState();
  const { selectThread } = useChatActions();
  const { threads, deleteThread } = useThreads();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  const handleHistoryDropdownHover = () => {
    // Refetch threads when hovering over the history dropdown
    queryClient.refetchQueries({
      queryKey: ["langgraph", "threads", "search"],
    });
  };

  const handleThreadSelect = (threadId: string): void => {
    selectThread(threadId);
  };

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

  return (
    <>
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
