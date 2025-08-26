"use client";

import { Settings, Edit2, Eye, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelManageResourceProps {
  onSelect: (value: string) => void;
}

export function CommandPanelManageResource({ onSelect }: CommandPanelManageResourceProps) {
  return (
    <>
      <CommandGroup heading="Manage Options">
        <CommandItem value="view-resource" onSelect={onSelect}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Resource</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="edit-resource" onSelect={onSelect}>
          <Edit2 className="mr-2 h-4 w-4" />
          <span>Edit Resource</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="configure-resource" onSelect={onSelect}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configure Resource</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="monitor-resource" onSelect={onSelect}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Monitor Resource</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
