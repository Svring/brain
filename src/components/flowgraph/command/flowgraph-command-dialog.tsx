"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandListWithMovingBg,
} from "@/components/ui/command";
import { CommandPanelMain } from "./command-panel-main";
import { ResourceList, ResourceCreate } from "./command-panel-add-resource";
import { useCommandActions } from "./command-actions";

interface FlowgraphCommandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlowgraphCommandDialog({
  isOpen,
  onOpenChange,
}: FlowgraphCommandDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [showResourceList, setShowResourceList] = useState(false);

  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearch("");
      setSelectedCommand(null);
      setShowResourceList(false);
    }
    onOpenChange(open);
  };

  const { handleSelect, handleResourceSelect, handleBack } = useCommandActions({
    onOpenChange: handleOpenChange,
    setSearch,
    setSelectedCommand,
    setShowResourceList,
  });

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Handle Tab key for going back
      if (event.key === 'Tab') {
        event.preventDefault();
        if (selectedCommand) {
          setSelectedCommand(null);
        } else if (showResourceList) {
          setShowResourceList(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedCommand, showResourceList]);

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="bg-background-tertiary p-0.5">
        <div className="flex flex-col bg-background-secondary rounded-lg">
          {/* Top Input - Full Width */}
          <div className="border-b border-border flex-shrink-0">
            <CommandInput
              placeholder="Search commands..."
              value={search}
              onValueChange={setSearch}
            />
          </div>

          {/* Content */}
          <div className="min-h-0 transition-all duration-300 ease-out">
            {selectedCommand ? (
              // Show create form for selected resource
              <ResourceCreate
                resourceId={selectedCommand}
                onBack={() => setSelectedCommand(null)}
              />
            ) : showResourceList ? (
              // Show resource list when "Add Resource" is selected
              <CommandListWithMovingBg>
                <CommandEmpty>No resources found.</CommandEmpty>
                <ResourceList
                  onSelect={handleResourceSelect}
                  onBack={() => setShowResourceList(false)}
                />
              </CommandListWithMovingBg>
            ) : (
              // Show main command list
              <CommandListWithMovingBg>
                <CommandEmpty>No commands found.</CommandEmpty>
                <CommandPanelMain onSelect={handleSelect} />
              </CommandListWithMovingBg>
            )}
          </div>

          {/* Keyboard shortcuts help */}
          <div className="border-t border-border p-2">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-4 items-center gap-1 rounded border px-1 font-mono font-medium opacity-100 select-none text-xs">
                  ↑
                </kbd>
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-4 items-center gap-1 rounded border px-1 font-mono font-medium opacity-100 select-none text-xs">
                  ↓
                </kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-4 items-center gap-1 rounded border px-1 font-mono font-medium opacity-100 select-none text-xs">
                  Enter
                </kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-4 items-center gap-1 rounded border px-1 font-mono font-medium opacity-100 select-none text-xs">
                  Tab
                </kbd>
                <span>to go back</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-4 items-center gap-1 rounded border px-1 font-mono font-medium opacity-100 select-none text-xs">
                  Esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}
