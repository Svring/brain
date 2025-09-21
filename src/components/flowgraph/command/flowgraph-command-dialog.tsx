"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandListAnimated,
} from "@/components/ui/command";
import { CommandPanelMain } from "./command-panel-main";
import { ResourceList, ResourceCreate } from "./command-panel-add-resource";
import { ManageResources } from "./command-panel-manage-resources";
import { ExistingResources } from "./command-panel-existing-resources";
import { useCommandActions } from "./command-actions";
import { AddNewResources } from "@/components/project/add-new-resources";

interface FlowgraphCommandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}

export function FlowgraphCommandDialog({
  isOpen,
  onOpenChange,
  onClose,
}: FlowgraphCommandDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [showResourceList, setShowResourceList] = useState(false);
  // const [showManageResources, setShowManageResources] = useState(false);
  // const [showExistingResources, setShowExistingResources] = useState(false);
  const [showAddResources, setShowAddResources] = useState(false);

  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearch("");
      setSelectedCommand(null);
      setShowResourceList(false);
      // setShowManageResources(false);
      // setShowExistingResources(false);
      setShowAddResources(false);
    }
    onOpenChange(open);
  };

  const { handleSelect, handleResourceSelect, handleBack } = useCommandActions({
    onOpenChange: handleOpenChange,
    setSearch,
    setSelectedCommand,
    setShowResourceList,
    // setShowManageResources,
    // setShowExistingResources,
  });

  // Custom handler for add resources
  const handleSelectWithAddResources = (value: string) => {
    if (value === "add-resource") {
      setShowAddResources(true);
    } else {
      handleSelect(value);
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Handle Tab key for going back
      if (event.key === "Tab") {
        event.preventDefault();
        if (selectedCommand) {
          setSelectedCommand(null);
        } /* else if (showManageResources) {
          setShowManageResources(false);
        } else if (showExistingResources) {
          setShowExistingResources(false);
        } */ else if (showResourceList) {
          setShowResourceList(false);
        } else if (showAddResources) {
          setShowAddResources(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    selectedCommand,
    showResourceList,
    // showManageResources,
    // showExistingResources,
    showAddResources,
  ]);

  return (
    <>
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
                  onSuccess={onClose}
                /> /* : showManageResources ? (
                // Show manage resources dialog
                <ManageResources onBack={() => setShowManageResources(false)} />
              ) : showExistingResources ? (
                // Show existing resources dialog
                <ExistingResources
                  onBack={() => setShowExistingResources(false)}
                />
              ) */
              ) : showAddResources ? (
                // Show add new resources panel
                <AddNewResources
                  onBack={() => setShowAddResources(false)}
                  onSuccess={onClose}
                />
              ) : showResourceList ? (
                // Show resource list when "Add Resource" is selected
                <CommandListAnimated>
                  <CommandEmpty>No resources found.</CommandEmpty>
                  <ResourceList
                    onSelect={handleResourceSelect}
                    onBack={() => setShowResourceList(false)}
                  />
                </CommandListAnimated>
              ) : (
                // Show main command list
                <CommandListAnimated>
                  <CommandEmpty>No commands found.</CommandEmpty>
                  <CommandPanelMain onSelect={handleSelectWithAddResources} />
                </CommandListAnimated>
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
    </>
  );
}
