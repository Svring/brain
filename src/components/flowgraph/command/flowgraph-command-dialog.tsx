"use client";

import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { CommandPanelMain } from "./command-panel-main";
import { CommandPanelAddResource } from "./command-panel-add-resource";
import { CommandPanelRemoveResource } from "./command-panel-remove-resource";
import { CommandPanelManageResource } from "./command-panel-manage-resource";
import { CommandPanelConnectResource } from "./command-panel-connect-resource";
import { CommandPanelSearchNode } from "./command-panel-search-node";
import { CommandPanelCreateProject } from "./command-panel-create-project";
import { CommandPanelGoToProject } from "./command-panel-go-to-project";
import { CommandNavigation } from "./command-navigation";
import { useCommandActions } from "./command-actions";

interface FlowgraphCommandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type CommandPanel =
  | "main"
  | "add-resource"
  | "remove-resource"
  | "manage-resource"
  | "connect-resource"
  | "search-node"
  | "create-project"
  | "go-to-project";

export function FlowgraphCommandDialog({
  isOpen,
  onOpenChange,
}: FlowgraphCommandDialogProps) {
  const [search, setSearch] = useState("");
  const [currentPanel, setCurrentPanel] = useState<CommandPanel>("main");

  // Reset panel when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentPanel("main");
      setSearch("");
    }
    onOpenChange(open);
  };

  const { handleSelect } = useCommandActions({
    onOpenChange: handleOpenChange,
    setCurrentPanel,
    setSearch,
  });

  const renderCurrentPanel = () => {
    switch (currentPanel) {
      case "add-resource":
        return <CommandPanelAddResource onSelect={handleSelect} />;
      case "remove-resource":
        return <CommandPanelRemoveResource onSelect={handleSelect} />;
      case "manage-resource":
        return <CommandPanelManageResource onSelect={handleSelect} />;
      case "connect-resource":
        return <CommandPanelConnectResource onSelect={handleSelect} />;
      case "search-node":
        return <CommandPanelSearchNode onSelect={handleSelect} />;
      case "create-project":
        return <CommandPanelCreateProject onSelect={handleSelect} />;
      case "go-to-project":
        return <CommandPanelGoToProject onSelect={handleSelect} />;
      default:
        return <CommandPanelMain onSelect={handleSelect} />;
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder={
          currentPanel === "main"
            ? "Search commands..."
            : `Search ${currentPanel.replace("-", " ")}...`
        }
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        {currentPanel !== "main" && (
          <CommandNavigation onSelect={handleSelect} />
        )}

        {renderCurrentPanel()}
      </CommandList>
    </CommandDialog>
  );
}
