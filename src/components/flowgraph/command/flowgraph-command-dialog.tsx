"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { CommandPanelMain } from "./command-panel-main";
import { AddResourcePreview } from "./command-panel-add-resource";
import { useCommandActions } from "./command-actions";
import { useCommandState } from "cmdk";

interface FlowgraphCommandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function SelectedValueSync({
  onChange,
}: {
  onChange: (value: string | null) => void;
}) {
  const value = useCommandState((state: any) => state.value);
  useEffect(() => {
    onChange(value || null);
  }, [value, onChange]);
  return null;
}

export function FlowgraphCommandDialog({
  isOpen,
  onOpenChange,
}: FlowgraphCommandDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [hoveredCommand, setHoveredCommand] = useState<string | null>(null);
  const [keyboardSelectedCommand, setKeyboardSelectedCommand] = useState<
    string | null
  >(null);

  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearch("");
      setSelectedCommand(null);
      setIsDetailMode(false);
      setHoveredCommand(null);
      setKeyboardSelectedCommand(null);
    }
    onOpenChange(open);
  };

  const { handleSelect } = useCommandActions({
    onOpenChange: handleOpenChange,
    setSearch,
    setSelectedCommand,
    setIsDetailMode,
  });

  const handleCommandSelect = (value: string) => {
    setSelectedCommand(value);
    setIsDetailMode(true);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex flex-col h-full">
        <SelectedValueSync onChange={setKeyboardSelectedCommand} />
        {/* Top Input - Full Width */}
        <div className="border-b border-border flex-shrink-0">
          <CommandInput
            placeholder="Search commands..."
            value={search}
            onValueChange={setSearch}
          />
        </div>

        {/* Bottom Content - Sidebar and Details */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar - Commands */}
          <div className="w-[20%] border-r border-border flex flex-col min-h-0">
            <CommandList className="flex-1 overflow-auto max-h-none h-full">
              <CommandEmpty>No commands found.</CommandEmpty>

              <CommandPanelMain
                onSelect={handleSelect}
                onHover={setHoveredCommand}
                onKeyboardSelect={setKeyboardSelectedCommand}
              />
            </CommandList>
          </div>

          {/* Right Side - Details */}
          <div className="w-[80%] flex flex-col min-h-0 bg-background">
            {isDetailMode && selectedCommand === "add-resource" ? (
              <AddResourcePreview
                onSelect={handleCommandSelect}
                autoFocus={true}
              />
            ) : hoveredCommand === "add-resource" ||
              keyboardSelectedCommand === "add-resource" ? (
              <AddResourcePreview onSelect={handleCommandSelect} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a command to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}
