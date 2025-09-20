"use client";

import {
  SearchIcon,
  Scan,
  RefreshCcw,
  MessageCircle,
  Command,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StarBorder } from "@/components/ui/star-border";
import { cn } from "@/lib/utils";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useReactFlow } from "@xyflow/react";

interface FlowgraphActionsProps {
  onSearchChange?: (searchTerm: string) => void;
  onScan?: () => void;
  onRefresh?: () => void;
  onOpenCommand?: () => void;
}

export function FlowgraphActions({
  onSearchChange,
  onScan,
  onRefresh,
  onOpenCommand,
}: FlowgraphActionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fitView, refresh } = useFlowgraphActions();
  const { openProjectChat } = useChatActions();
  const { focusedResourceTarget } = useChatState();
  const { selectedProject } = useProjectState();
  const queryClient = useQueryClient();
  const { project, devbox, cluster, launchpad, objectstorage } =
    useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { zoomIn, zoomOut } = useReactFlow();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleOpenProjectChat = () => {
    if (selectedProject) {
      openProjectChat(selectedProject);
    }
  };

  const handleRefresh = () => {
    // if (onRefresh) {
    //   onRefresh();
    // } else {
    //   // Default behavior: just refresh flowgraph
    //   refresh();
    // }
    invalidateQueries([
      // devbox.list.queryKey(),
      launchpad.get.queryKey(),
      // objectstorage.list.queryKey(),
    ]);
  };

  const handleOpenCommand = () => {
    onOpenCommand?.();
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Zoom In Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>

        {/* Zoom Out Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        {/* Scan Button */}
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleScan}
            >
              <Scan className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit Viewport</p>
          </TooltipContent>
        </Tooltip> */}

        {/* Refresh Button */}
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh</p>
          </TooltipContent>
        </Tooltip> */}

        {/* Command Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="h-8 px-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-1.5"
              onClick={handleOpenCommand}
            >
              <Command className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">+ K</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open Command Menu</p>
          </TooltipContent>
        </Tooltip>

        {/* Open Project Chat Button */}
        {!focusedResourceTarget && (
          <Tooltip>
            <TooltipTrigger asChild>
              <StarBorder
                isRound
                className={cn(
                  "h-10 w-10 cursor-pointer hover:scale-105 transition-transform"
                )}
                onClick={handleOpenProjectChat}
              >
                <MessageCircle className="h-4 w-4" />
              </StarBorder>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Project Chat</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
