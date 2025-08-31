"use client";

import { Plus } from "lucide-react";
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
      </CommandGroup>
    </>
  );
}
