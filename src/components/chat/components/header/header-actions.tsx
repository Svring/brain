"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Plus,
  ChevronRight,
  Focus,
  History,
} from "lucide-react";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjectState } from "@/contexts/project/project-context";
import { useReactFlow } from "@xyflow/react";
import { HistoryDropdown } from "./history-dropdown";

interface HeaderActionsProps {
  onNewChat: () => void;
}

export function HeaderActions({ onNewChat }: HeaderActionsProps) {
  const { selectedResource } = useProjectState();
  const { sidebarChatMaximized } = useChatState();
  const { closeSidebarChat, maximizeSidebar, minimizeSidebar } = useChatActions();
  const { fitView } = useReactFlow();

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onNewChat}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
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
  );
}
