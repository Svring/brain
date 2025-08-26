"use client";

import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { CommandPanelMain } from "./command-panel-main";
import { CommandPanelAddNode } from "./command-panel-add-node";
import { CommandPanelProjectSettings } from "./command-panel-project-settings";
import { CommandPanelImportExport } from "./command-panel-import-export";
import { CommandNavigation } from "./command-navigation";
import { useCommandActions } from "./command-actions";

interface FlowgraphCommandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type CommandPanel = "main" | "add-node" | "project-settings" | "import-export";

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
      case "add-node":
        return <CommandPanelAddNode onSelect={handleSelect} />;
      case "project-settings":
        return <CommandPanelProjectSettings onSelect={handleSelect} />;
      case "import-export":
        return <CommandPanelImportExport onSelect={handleSelect} />;
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
