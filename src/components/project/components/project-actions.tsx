"use client";

import { Plus, RefreshCw } from "lucide-react";
import { MenuBar, MenuBarItem } from "./menu-bar";

interface ProjectActionsProps {
  onAddNew: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function ProjectActions({ onAddNew, onRefresh, isRefreshing }: ProjectActionsProps) {
  const menuItemsRight: MenuBarItem[] = [
    {
      icon: isRefreshing
        ? () => <RefreshCw className="animate-spin" />
        : RefreshCw,
      label: "Refresh",
      onClick: onRefresh,
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