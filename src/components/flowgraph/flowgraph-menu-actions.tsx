"use client";

import { Plus, Eye, Settings, Play, Pause, RefreshCw } from "lucide-react";
import { MenuBar, MenuBarItem } from "../project/menu-bar";
import { useQueryClient } from "@tanstack/react-query";
import { useChatState } from "@/contexts/chat/chat-context";

interface FlowgraphMenuActionsProps {
  onAddNew: () => void;
  onDisplayEnv: () => void;
  onStartAll: () => void;
  onPauseAll: () => void;
  isStarting?: boolean;
  isPausing?: boolean;
  disabled?: boolean;
}

export function FlowgraphMenuActions({
  onAddNew,
  onDisplayEnv,
  onStartAll,
  onPauseAll,
  isStarting = false,
  isPausing = false,
  disabled = false,
}: FlowgraphMenuActionsProps) {
  const { sidebarChatOpen } = useChatState();

  const menuItemsRight: MenuBarItem[] = [
    // {
    //   icon: RefreshCw,
    //   label: "Refresh",
    //   onClick: handleRefresh,
    //   isToggle: false,
    // },
    {
      icon: Settings,
      label: "Display Env",
      onClick: onDisplayEnv,
      isToggle: false,
    },
    // {
    //   icon: Play,
    //   label: isStarting ? "Starting..." : "Start All",
    //   onClick: onStartAll,
    //   isToggle: false,
    // },
    // {
    //   icon: Pause,
    //   label: isPausing ? "Pausing..." : "Pause All",
    //   onClick: onPauseAll,
    //   isToggle: false,
    // },
    {
      icon: Plus,
      label: "Add New",
      onClick: onAddNew,
      isToggle: false,
    },
  ];

  return (
    <div className="absolute top-2 right-2 z-20">
      <MenuBar activeIndex={null} items={menuItemsRight} disabled={disabled} />
    </div>
  );
}
