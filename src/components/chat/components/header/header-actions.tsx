"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Plus, ChevronRight, Focus, History } from "lucide-react";
import { useChatActions } from "@/contexts/chat/chat-context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useProjectState,
  useProjectActions,
} from "@/contexts/project/project-context";
import { useReactFlow } from "@xyflow/react";
import { HistoryDropdown } from "./history-dropdown";
import { useThreads } from "@/components/provider/thread-provider";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useChatInstance } from "@/components/provider/chat-instance-provider";

export function HeaderActions() {
  const { selectedProject } = useProjectState();
  const { clearSelectedResource } = useProjectActions();
  const { resourceTarget, state } = useChatInstance();
  const {
    closeChat,
    setChatState,
    setChatThreadId,
    setChatThreads,
    closeProjectChat,
    setProjectChatThreadId,
    setProjectChatState,
    setProjectChatThreads,
  } = useChatActions();
  const { fitView } = useReactFlow();
  const { createNewThread, getThreads } = useThreads();
  const { auth } = useAuthState();

  // Function to refetch and update threads
  const refetchAndUpdateThreads = async () => {
    try {
      const updatedThreads = await getThreads(resourceTarget);
      if (resourceTarget === null) {
        setProjectChatThreads(updatedThreads);
      } else {
        setChatThreads(resourceTarget, updatedThreads);
      }
    } catch (error) {
      console.error("HeaderActions - Failed to refetch threads:", error);
    }
  };

  const handleNewChat = () => {
    createNewThread.mutate(
      {
        metadata: {
          kubeconfig: auth?.kubeconfig,
          projectName: selectedProject,
          resourceTarget: resourceTarget,
        },
      },
      {
        onSuccess: (data: any) => {
          if (data?.thread_id) {
            // Set the newly created thread ID in the chat instance
            if (resourceTarget === null) {
              setProjectChatThreadId(data.thread_id);
            } else {
              setChatThreadId(resourceTarget, data.thread_id);
            }

            // Refetch and update threads after successful creation
            refetchAndUpdateThreads();
          }
        },
        onError: (error: any) => {
          console.error("Failed to create new thread:", error);
        },
      }
    );
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleNewChat}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={createNewThread.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>New Chat</TooltipContent>
      </Tooltip>

      <HistoryDropdown />

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            pressed={state.maximized}
            onPressedChange={(pressed) => {
              if (resourceTarget === null) {
                setProjectChatState({ maximized: pressed });
              } else {
                setChatState(resourceTarget, { maximized: pressed });
              }
            }}
            size="sm"
            className={cn(
              "h-8 w-8 hover:text-theme-blue",
              state.maximized && "text-theme-blue"
            )}
          >
            <Focus className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>{state.maximized ? "Unfocus" : "Focus"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              if (resourceTarget === null) {
                closeProjectChat();
              } else {
                closeChat(resourceTarget);
                clearSelectedResource(); // Clear selected resource when closing resource chat
              }
            }}
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
    </TooltipProvider>
  );
}
