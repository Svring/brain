"use client";

import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelImportExportProps {
  onSelect: (value: string) => void;
}

export function CommandPanelImportExport({ onSelect }: CommandPanelImportExportProps) {
  return (
    <>
      <CommandGroup heading="Export">
        <CommandItem value="export-json" onSelect={onSelect}>
          <span>Export as JSON</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="export-png" onSelect={onSelect}>
          <span>Export as PNG</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Import">
        <CommandItem value="import-json" onSelect={onSelect}>
          <span>Import from JSON</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
