"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Plus, ChevronRight, Focus, History, Loader2 } from "lucide-react";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
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
import { useChatClosing } from "../../chat-closing-context";
import { serializeResourceTarget, getProjectChatKey } from "@/contexts/chat/chat-machine";

export function HeaderActions() {
  const { selectedProject, selectedResource } = useProjectState();
  const { clearSelectedResource } = useProjectActions();
  const { resourceTarget, state } = useChatInstance();
  const { chatInstances, activeResourceTargets } = useChatState();
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
  const { startClosing } = useChatClosing();

  const refetchAndUpdateThreads = async () => {
    try {
      const updatedThreads = await getThreads(resourceTarget);
      if (resourceTarget === null) {
        setProjectChatThreads(selectedProject!, updatedThreads);
      } else {
        setChatThreads(resourceTarget, updatedThreads);
      }
    } catch (error) {
      // Failed to refetch threads
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
            if (resourceTarget === null) {
              setProjectChatThreadId(selectedProject!, data.thread_id);
            } else {
              setChatThreadId(resourceTarget, data.thread_id);
            }

            refetchAndUpdateThreads();
          }
        },
        onError: (error: any) => {
          // Failed to create new thread
        },
      }
    );
  };

  const hasCascadingChats = (() => {
    if (!selectedProject) return false;
    
    let hasProjectChat = false;
    let hasResourceChat = false;
    
    for (const [key, instance] of chatInstances.entries()) {
      if (key.startsWith("__project__") && instance.projectName === selectedProject) {
        hasProjectChat = true;
      }
      if (instance.resourceTarget && !key.startsWith("__project__")) {
        hasResourceChat = true;
      }
    }
    
    return hasProjectChat && hasResourceChat;
  })();

  const handleClose = () => {
    if (resourceTarget === null) {
      const projectChatKey = getProjectChatKey(selectedProject!);
      startClosing(projectChatKey, () => {
        closeProjectChat(selectedProject!);
      });
    } else {
      const resourceChatKey = serializeResourceTarget(resourceTarget);
      startClosing(resourceChatKey, () => {
        closeChat(resourceTarget);
        if (!hasCascadingChats) {
          clearSelectedResource();
        }
      });
    }
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
              {createNewThread.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {createNewThread.isPending ? "Creating..." : "New Chat"}
          </TooltipContent>
        </Tooltip>

        <HistoryDropdown />

        {selectedResource && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={state.maximized}
                onPressedChange={(pressed) => {
                  if (resourceTarget === null) {
                    setProjectChatState(selectedProject!, { maximized: pressed });
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
            <TooltipContent>
              {state.maximized ? "Unfocus" : "Focus"}
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleClose}
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