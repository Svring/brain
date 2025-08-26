"use client";

import { Trash2, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelRemoveResourceProps {
  onSelect: (value: string) => void;
}

export function CommandPanelRemoveResource({ onSelect }: CommandPanelRemoveResourceProps) {
  return (
    <>
      <CommandGroup heading="Remove Options">
        <CommandItem value="remove-selected" onSelect={onSelect}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remove Selected</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="remove-all" onSelect={onSelect}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remove All Resources</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="remove-by-type" onSelect={onSelect}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remove by Type</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
