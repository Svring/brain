"use client";

import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelAddNodeProps {
  onSelect: (value: string) => void;
}

export function CommandPanelAddNode({ onSelect }: CommandPanelAddNodeProps) {
  return (
    <>
      <CommandGroup heading="Node Types">
        <CommandItem value="add-default-node" onSelect={onSelect}>
          <div className="mr-2 h-4 w-4 rounded border-2 border-gray-300" />
          <span>Default Node</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="add-resource-node" onSelect={onSelect}>
          <div className="mr-2 h-4 w-4 rounded bg-blue-500" />
          <span>Resource Node</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
