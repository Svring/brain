"use client";

import { Edit2, Trash2 } from "lucide-react";
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelProjectSettingsProps {
  onSelect: (value: string) => void;
}

export function CommandPanelProjectSettings({ onSelect }: CommandPanelProjectSettingsProps) {
  return (
    <>
      <CommandGroup heading="Project Settings">
        <CommandItem value="rename-project" onSelect={onSelect}>
          <Edit2 className="mr-2 h-4 w-4" />
          <span>Rename Project</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="delete-project" onSelect={onSelect}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Project</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="duplicate-project" onSelect={onSelect}>
          <span>Duplicate Project</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
