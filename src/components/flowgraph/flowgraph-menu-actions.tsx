"use client";

import { Plus, Eye, Play, Pause } from "lucide-react";
import { MenuBar, MenuBarItem } from "../project/menu-bar";

interface FlowgraphMenuActionsProps {
  onAddNew: () => void;
  onDisplayEnv: () => void;
  onStartAll: () => void;
  onPauseAll: () => void;
  isStarting?: boolean;
  isPausing?: boolean;
}

export function FlowgraphMenuActions({ 
  onAddNew, 
  onDisplayEnv, 
  onStartAll, 
  onPauseAll,
  isStarting = false,
  isPausing = false
}: FlowgraphMenuActionsProps) {
  const menuItemsRight: MenuBarItem[] = [
    {
      icon: Eye,
      label: "Display Env",
      onClick: onDisplayEnv,
      isToggle: false,
    },
    {
      icon: Play,
      label: isStarting ? "Starting..." : "Start All",
      onClick: onStartAll,
      isToggle: false,
    },
    {
      icon: Pause,
      label: isPausing ? "Pausing..." : "Pause All",
      onClick: onPauseAll,
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
      <MenuBar activeIndex={null} items={menuItemsRight} />
    </div>
  );
}
