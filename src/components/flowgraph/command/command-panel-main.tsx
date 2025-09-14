"use client";

import { Plus, Settings } from "lucide-react";
import {
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface CommandPanelMainProps {
  onSelect: (value: string) => void;
}

export function CommandPanelMain({
  onSelect,
}: CommandPanelMainProps) {
  return (
    <>
      <CommandGroup heading="Project">
        <CommandItem
          value="add-resource"
          onSelect={onSelect}
        >
          <Plus className="h-4 w-4" />
          <span>Add Resource</span>
        </CommandItem>
        <CommandItem
          value="manage-resources"
          onSelect={onSelect}
        >
          <Settings className="h-4 w-4" />
          <span>Manage Resources</span>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
