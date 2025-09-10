"use client";

import { SearchIcon, Scan, RefreshCcw, MessageCircle } from "lucide-react";
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

interface FlowgraphActionsProps {
  onSearchChange?: (searchTerm: string) => void;
  onScan?: () => void;
  onRefresh?: () => void;
}

export function FlowgraphActions({
  onSearchChange,
  onScan,
  onRefresh,
}: FlowgraphActionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fitView } = useFlowgraphActions();
  const { openSidebarChat } = useChatActions();
  const { sidebarChatOpen } = useChatState();
  const queryClient = useQueryClient();
  const { project } = useTRPCClients();

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
    // Refetch project resources
    queryClient.refetchQueries({
      queryKey: project.getResources.queryKey(),
    });
    onRefresh?.();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Search Bar */}
        {/* <div className="relative">
          <Input
            className="h-8 w-48 pl-8 pr-8"
            placeholder="Search node..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <SearchIcon
            aria-hidden="true"
            className="absolute start-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <kbd className="bg-muted pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div> */}

        {/* Scan Button */}
        <Tooltip>
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
        </Tooltip>

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
