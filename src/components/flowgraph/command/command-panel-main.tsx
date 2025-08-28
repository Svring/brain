"use client";

import { Plus, ChevronRight } from "lucide-react";
import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandPanelMainProps {
  onSelect: (value: string) => void;
  onHover?: (value: string | null) => void;
  onKeyboardSelect?: (value: string | null) => void;
}

export function CommandPanelMain({
  onSelect,
  onHover,
  onKeyboardSelect,
}: CommandPanelMainProps) {
  return (
    <>
      <CommandGroup heading="Project">
        <CommandItem
          value="add-resource"
          onSelect={onSelect}
          onFocus={() => onKeyboardSelect?.("add-resource")}
          onBlur={() => onKeyboardSelect?.(null)}
        >
          <Plus className="h-4 w-4" />
          <span>Add Resource</span>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
