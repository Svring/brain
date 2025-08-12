"use client";

import { Plus } from "lucide-react";
import { MenuBar, MenuBarItem } from "../project/menu-bar";

interface FlowgraphMenuActionsProps {
  onAddNew: () => void;
}

export function FlowgraphMenuActions({ onAddNew }: FlowgraphMenuActionsProps) {
  const menuItemsRight: MenuBarItem[] = [
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
