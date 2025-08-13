"use client";

import { Plus, Eye } from "lucide-react";
import { MenuBar, MenuBarItem } from "../project/menu-bar";

interface FlowgraphMenuActionsProps {
  onAddNew: () => void;
  onDisplayEnv: () => void;
}

export function FlowgraphMenuActions({ onAddNew, onDisplayEnv }: FlowgraphMenuActionsProps) {
  const menuItemsRight: MenuBarItem[] = [
    {
      icon: Eye,
      label: "Display Env",
      onClick: onDisplayEnv,
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
