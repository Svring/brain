"use client";

import { Plus, Eye, Settings, Play, Pause, RefreshCw } from "lucide-react";
import { MenuBar, MenuBarItem } from "../project/menu-bar";
import { useQueryClient } from "@tanstack/react-query";
import { useChatState } from "@/contexts/chat/chat-context";

interface FlowgraphMenuActionsProps {
  onAddNew: () => void;
  onDisplayEnv: () => void;
  onManageStatus: () => void;
  disabled?: boolean;
}

export function FlowgraphMenuActions({
  onAddNew,
  onDisplayEnv,
  onManageStatus,
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
    {
      icon: Play,
      label: "Manage Status",
      onClick: onManageStatus,
      isToggle: false,
    },
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
