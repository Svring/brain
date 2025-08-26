"use client";

import { Command } from "lucide-react";
import { MenuBar, MenuBarItem } from "../project/menu-bar";
import { useFlowgraphCommand } from "@/hooks/flowgraph/use-flowgraph-command";

interface FlowgraphMenuActionsProps {
  onOpen: () => void;
}

export function FlowgraphMenuActions({ onOpen }: FlowgraphMenuActionsProps) {
  const menuItems: MenuBarItem[] = [
    {
      icon: Command,
      label: "Command",
      onClick: () => onOpen(),
    },
  ];

  return (
    <div className="absolute top-2 right-2 z-20">
      <MenuBar items={menuItems} />
    </div>
  );
}
