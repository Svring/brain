"use client";

import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
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

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex flex-col">
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
            <CommandList>
              <CommandEmpty>No resources found.</CommandEmpty>
              <ResourceList
                onSelect={handleResourceSelect}
                onBack={() => setShowResourceList(false)}
              />
            </CommandList>
          ) : (
            // Show main command list
            <CommandList>
              <CommandEmpty>No commands found.</CommandEmpty>
              <CommandPanelMain onSelect={handleSelect} />
            </CommandList>
          )}
        </div>
      </div>
    </CommandDialog>
  );
}
