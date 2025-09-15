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
  const { openSidebarChat } = useChatActions();
  const { sidebarChatOpen } = useChatState();
  const queryClient = useQueryClient();
  const { project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const { zoomIn, zoomOut } = useReactFlow();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleScan = () => {
    fitView();
    onScan?.();
  };

  const handleOpenSidebar = () => {
    openSidebarChat();
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Default behavior: just refresh flowgraph
      refresh();
    }
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
        <Tooltip>
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
        </Tooltip>

        {/* Command Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleOpenCommand}
            >
              <Command className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open Command Menu</p>
          </TooltipContent>
        </Tooltip>

        {/* Open Sidebar Button */}
        {!sidebarChatOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <StarBorder
                isRound
                className={cn(
                  "h-10 w-10 cursor-pointer hover:scale-105 transition-transform"
                )}
                onClick={handleOpenSidebar}
              >
                <MessageCircle className="h-4 w-4" />
              </StarBorder>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Chat</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
